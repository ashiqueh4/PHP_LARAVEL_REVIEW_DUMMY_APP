<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        'api/graphql',
        'api/webhooks',
        'storedata/postdata',
        'api/deletedata',
        'storedata/draft_orders',
        'api/draft_orders',
        'api/storeAppData'
    ];
}
