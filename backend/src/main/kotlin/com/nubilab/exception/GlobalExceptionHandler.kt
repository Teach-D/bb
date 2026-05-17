package com.nubilab.exception

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(FoodLogNotFoundException::class)
    fun handleFoodLogNotFound(e: FoodLogNotFoundException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.status(404).body(mapOf("error" to (e.message ?: "Not Found")))
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(e: MethodArgumentNotValidException): ResponseEntity<Map<String, String>> {
        val message = e.bindingResult.fieldErrors
            .firstOrNull()?.defaultMessage ?: "잘못된 요청입니다."
        return ResponseEntity.status(400).body(mapOf("error" to message))
    }
}
