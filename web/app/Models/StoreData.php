<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreData extends Model
{
    use HasFactory;
    protected $table = 'storedata';
    protected $fillable=['title','price','selectedoption','pidselected','shop'];
}
