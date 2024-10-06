<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Frontenddata;

class FrontController extends Controller
{
    //
    public function postdata(Request $request)
    {
       
        $ssata = new Frontenddata();
        $ssata->name = $request->name;
        $ssata->email = $request->email;
        $ssata->description = $request->description;
        $ssata->save();
     
        return response()->json(['status' =>200]);
    }
}
