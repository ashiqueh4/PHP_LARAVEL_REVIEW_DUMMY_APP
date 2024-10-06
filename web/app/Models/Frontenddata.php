<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Shopify\Rest\Admin2022_04\Shop;

class Frontenddata extends Model
{
    use HasFactory;
    protected $table = 'frontenddatas';
    protected $fillable=['name','email','description','Shop'];
}
