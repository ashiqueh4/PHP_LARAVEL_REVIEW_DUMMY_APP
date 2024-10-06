<?php

use App\Exceptions\ShopifyProductCreatorException;
use App\Lib\AuthRedirection;
use App\Lib\EnsureBilling;
use App\Lib\ProductCreator;
use App\Models\Session;
use Facade\FlareClient\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Shopify\Auth\OAuth;
use Shopify\Auth\Session as AuthSession;
use Shopify\Clients\HttpHeaders;
use Shopify\Clients\Rest;
use Shopify\Context;
use Shopify\Exception\InvalidWebhookException;
use Shopify\Utils;
use Shopify\Webhooks\Registry;
use Shopify\Webhooks\Topics;
use App\Models\Frontenddata;
use App\Models\StoreData;
use Illuminate\Support\Facades\Validator;




/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
| If you are adding routes outside of the /api path, remember to also add a
| proxy rule for them in web/frontend/vite.config.js
|
*/


Route::fallback(function (Request $request) {
    if (Context::$IS_EMBEDDED_APP &&  $request->query("embedded", false) === "1") {
        if (env('APP_ENV') === 'production') {
            return file_get_contents(public_path('index.html'));
        } else {
            return file_get_contents(base_path('frontend/index.html'));
        }
    } else {
        return redirect(Utils::getEmbeddedAppUrl($request->query("host", null)) . "/" . $request->path());
    }
})->middleware('shopify.installed');

Route::get('/api/auth', function (Request $request) {
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    // Delete any previously created OAuth sessions that were not completed (don't have an access token)
    Session::where('shop', $shop)->where('access_token', null)->delete();

    return AuthRedirection::redirect($request);
});

Route::get('/api/auth/callback', function (Request $request) {
    $session = OAuth::callback(
        $request->cookie(),
        $request->query(),
        ['App\Lib\CookieHandler', 'saveShopifyCookie'],
    );

    $host = $request->query('host');
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    $response = Registry::register('/api/webhooks', Topics::APP_UNINSTALLED, $shop, $session->getAccessToken());
    if ($response->isSuccess()) {
        Log::debug("Registered APP_UNINSTALLED webhook for shop $shop");
    } else {
        Log::error(
            "Failed to register APP_UNINSTALLED webhook for shop $shop with response body: " .
                print_r($response->getBody(), true)
        );
    }

    $redirectUrl = Utils::getEmbeddedAppUrl($host);
    if (Config::get('shopify.billing.required')) {
        list($hasPayment, $confirmationUrl) = EnsureBilling::check($session, Config::get('shopify.billing'));

        if (!$hasPayment) {
            $redirectUrl = $confirmationUrl;
        }
    }

    return redirect($redirectUrl);
});
Route::get('/api/shop', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); 
    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get('shop');

    return response($result->getDecodedBody());
})->middleware('shopify.auth');

Route::get('/api/products/count', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get('products/count');

    return response($result->getDecodedBody());
})->middleware('shopify.auth');
Route::get('/api/products', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get('products');

    return response($result->getDecodedBody());
})->middleware('shopify.auth');
Route::get('/api/products/{product_id}', function (Request $request,$product_id) {
    $session = $request->get('shopifySession'); 
    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get("products/$product_id");
    return response($result->getDecodedBody());
})->middleware('shopify.auth');


Route::get('/api/orders', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get('orders');

    return response($result->getDecodedBody());
})->middleware('shopify.auth');


Route::get('/api/products/create', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $success = $code = $error = null;
    try {
        ProductCreator::call($session, 5);
        $success = true;
        $code = 200;
        $error = null;
    } catch (\Exception $e) {
        $success = false;

        if ($e instanceof ShopifyProductCreatorException) {
            $code = $e->response->getStatusCode();
            $error = $e->response->getDecodedBody();
            if (array_key_exists("errors", $error)) {
                $error = $error["errors"];
            }
        } else {
            $code = 500;
            $error = $e->getMessage();
        }

        Log::error("Failed to create products: $error");
    } finally {
        return response()->json(["success" => $success, "error" => $error], $code);
    }
})->middleware('shopify.auth');

Route::post('/api/webhooks', function (Request $request) {
    try {
        $topic = $request->header(HttpHeaders::X_SHOPIFY_TOPIC, '');

        $response = Registry::process($request->header(), $request->getContent());
        if (!$response->isSuccess()) {
            Log::error("Failed to process '$topic' webhook: {$response->getErrorMessage()}");
            return response()->json(['message' => "Failed to process '$topic' webhook"], 500);
        }
    } catch (InvalidWebhookException $e) {
        Log::error("Got invalid webhook request for topic '$topic': {$e->getMessage()}");
        return response()->json(['message' => "Got invalid webhook request for topic '$topic'"], 401);
    } catch (\Exception $e) {
        Log::error("Got an exception when handling '$topic' webhook: {$e->getMessage()}");
        return response()->json(['message' => "Got an exception when handling '$topic' webhook"], 500);
    }
});

// app store data
Route::get('/api/getdata', function (Request $request) {
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $shop = $session->getShop();
    $result = Frontenddata::where("shop",$shop)->get();
    if ($result) {
        return response()->json([
            'success' => true,
            'data' => $result,
            'message' => "Task retrieved successfully.",
        ]); 
    } else {
        return response()->json([
            'success' => false,
            'message' => "Task not found!",
        ], 404);
    }
    
})->middleware('shopify.auth');
Route::delete('/api/deletedata', function (Request $request) {
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active
    $id = $request->id;
    $shop = $session->getShop();
    $result = Frontenddata::where(
        [
            ['shop', '=', $shop],
            ['id', '=', $id]
        ]
    )->delete();
    if ($result) {
        return response()->json([
            'success' => true,
            'message' => "item has deleted successfully.",
        ]); 
    } else {
        return response()->json([
            'success' => false,
            'message' => "Task not found!",
        ], 404);
    }


})->middleware('shopify.auth');

//store app data for use on product single page
Route::post('/api/storeAppData', function (Request $request) {
    $session = $request->get('shopifySession'); 
    $shop =$session->getShop();
    $ssata = new StoreData();
    $formData = json_decode(request()->getContent());
    $ssata->title = $formData->title;
    $ssata->price = $formData ->price;
    $ssata->selectedoption = $formData ->selectedp;
    $ssata->pidselected =(integer)$formData ->pidselected;
    $ssata->ptitle =$formData ->ptitle;
    $ssata->pimage =$formData ->pimage;
    $ssata->purl =$formData ->phandle;
    $ssata->shop = $shop;    ;
    $ssata->save();

    if(!$ssata->save()){
        return response()->json(['message' =>'data has not been saved.'],500);
    }

    return response()->json(['message' =>'data has been save.'],201);

})->middleware('shopify.auth');
Route::get('/api/storeAppData', function (Request $request) {
    
    $session = $request->get('shopifySession'); 

    $shop = $session->getShop();
    $result = StoreData::where("shop",$shop)->get();
    
    if ($result) {
        return response()->json($result); 
    } else {
        return response()->json([
            'success' => false,
            'message' => "Task not found!",
        ], 404);
    }
    
})->middleware('shopify.auth');
Route::delete('/api/storeAppData', function (Request $request) {
    $session = $request->get('shopifySession'); 
    $id = $request->id;
    $shop = $session->getShop();
    $result = StoreData::where(
        [
            ['shop', '=', $shop],
            ['id', '=', $id]
        ]
    )->delete();
    if ($result) {
        return response()->json([
            'success' => true,
            'message' => "item has deleted successfully.",
        ]); 
    } else {
        return response()->json([
            'success' => false,
            'message' => "Task not found!",
        ], 404);
    }


})->middleware('shopify.auth');
// app poxy
Route::get('/storedata/getdata', function (Request $request) {
    $shop = Utils::sanitizeShopDomain($request->query('shop'));
    $ssata = Frontenddata::where("shop",$shop)->get();
    return response()->json(["data"=>$ssata]);
});
Route::get('/storedata/getproductaddon', function (Request $request) {
    $shop = Utils::sanitizeShopDomain($request->query('shop'));
    $pidselected=$request->query('pidselected');
    $pAddons = StoreData::where([['shop',$shop],['pidselected',$pidselected]])->get();
    return response()->json($pAddons);
});

Route::post('/storedata/postdata', function (Request $request) {
   //model oject call
    $ssata = new Frontenddata();
    //data valadtion
    $validator = Validator::make($request->all(), [
        'name' => ['required'],
        'email' => ['required','email'],
        'description' => ['required'],
        'shop' => ['required']
    ]);
    if ($validator->fails()) {
        // Return errors or redirect back with errors
        return response()->json($validator->errors());
    }

    $ssata->name = $request->name;
    $ssata->email = $request->email;
    $ssata->description = $request->description;
    $ssata->shop = $request->shop;
    $ssata->save();
    //data saving
    return response()->json(['state' =>200]);
});

//create draft order
Route::post('/storedata/draft_orders', function (Request $request) {

    $shop = Utils::sanitizeShopDomain($request->post('shop')); 
    $cartValue = $request->post('cartv'); 
    $ssata = Session::where("shop",$shop)->get();
    $clients = new Rest($ssata[0]->shop, $ssata[0]->access_token);

        $lineItems = [];
        $i = 10;
        foreach ($cartValue  as $item) {
            $lineItem = [];
            $lineItemc = [];
            $lineItem['quantity'] = $item['custompQn'];

            
            if (!empty($item['custompPro'])) {
                $lineItem['variant_id'] = $item['custompId'];
                $properties = [];
                $customkey="Custom Product";
                $customval=rand(1000,9999)+$i++;
                $properties[]= [
                    'name' => $customkey,
                    'value' => $customval
                ];

                $lineItem['properties'] = $properties;
            } else {
                $lineItem['variant_id'] = $item['custompId'];
                // $lineItem['title'] = $item['custompTit'];
            }

            if (!empty($item['custompPri'])) {
                $lineItemc['title'] ="Customization Cost for".$item['custompTit'];
                $lineItemc['quantity'] = $item['custompQn'];
                $lineItemc['price'] = $item['custompPri'];
                $propertiesc = [];
                foreach ($item['custompPro'] as $key => $value) {
                    $propertiesc[] = [
                        'name' => $key,
                        'value' => $value
                    ];
                }
                
                $lineItemc['properties'] = $propertiesc;
                $lineItems[] = $lineItemc;
            } 

            

            $lineItems[] = $lineItem;
            
        }

            // $result = $clients->get('products');
            // $resultt= response($result->getDecodedBody());
               // Data for creating the draft order
                $data = [
                    'draft_order' => [
                        'line_items' =>$lineItems,
                        'customer' => [
                        'email' => '',
                        ],
    
                    ]
                ];
    
                $responsess = $clients->post('draft_orders',$data);
                if ($responsess->getStatusCode() === 201) {
                    $bodyss = $responsess->getBody()->getContents();
                    $draftOrderss = json_decode($bodyss, true);
                    // echo 'Draft order created successfully: ' . $draftOrderss['draft_order']['id'];
                    // echo 'Draft order created successfully: ' . $draftOrderss['draft_order']['invoice_url'];
                    return response()->json([
                        "checkout_url"=>$draftOrderss['draft_order']['invoice_url'],
                        "order_id"=>$draftOrderss['draft_order']['id'],
                    ]);
                } else {
                    // echo 'Error creating draft order: ' . $responsess->getBody()->getContents();
                    return response()->json(["error"=>$responsess->getBody()->getContents()]);
                }
                // return response()->json(["ssd"=>$responsess->getStatusCode()]);
                // return response()->json(["ssd"=>$shop,"cartv"=>$cartValue]);
        
        
});