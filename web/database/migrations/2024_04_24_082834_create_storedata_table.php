<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStoreDataTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('storedata', function (Blueprint $table) {
            $table->id();
            $table->text('title');
            $table->float('price');
            $table->string('selectedoption');
            $table->bigInteger('pidselected');
            $table->text('ptitle');
            $table->longText('pimage');
            $table->longText('purl');
            $table->text('shop');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('storedata');
    }
}
