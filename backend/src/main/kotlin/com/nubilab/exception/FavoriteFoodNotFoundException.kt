package com.nubilab.exception

class FavoriteFoodNotFoundException(id: Long) : RuntimeException("즐겨찾기를 찾을 수 없습니다. id=$id")
