package com.nubilab.exception

class FoodLogNotFoundException(id: Long) : RuntimeException("FoodLog을 찾을 수 없습니다. id=$id")
