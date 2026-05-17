package com.nubilab.exception

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

data class FieldError(val field: String, val message: String)
data class ValidationErrorResponse(val status: Int, val errors: List<FieldError>)

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(FoodLogNotFoundException::class)
    fun handleFoodLogNotFound(e: FoodLogNotFoundException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.status(404).body(mapOf("error" to (e.message ?: "Not Found")))
    }

    @ExceptionHandler(FavoriteFoodNotFoundException::class)
    fun handleFavoriteFoodNotFound(e: FavoriteFoodNotFoundException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.status(404).body(mapOf("error" to (e.message ?: "Not Found")))
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(e: MethodArgumentNotValidException): ResponseEntity<ValidationErrorResponse> {
        val errors = e.bindingResult.fieldErrors.map { fieldError ->
            FieldError(
                field = fieldError.field,
                message = fieldError.defaultMessage ?: "잘못된 값입니다.",
            )
        }
        return ResponseEntity.status(400).body(ValidationErrorResponse(status = 400, errors = errors))
    }
}
