package com.example

import android.util.Log
import android.webkit.JavascriptInterface
import com.google.firebase.Firebase
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.Schema
import com.google.firebase.ai.type.generationConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout

private const val TAG = "TattooAiService"

class TattooAiService {

  // JSON Схема за структурирана оценка на татуировки чрез Gemini
  private val assessmentSchema = Schema.obj(
    properties = mapOf(
      "complexityLevel" to Schema.string(description = "Ниво на сложност от 1 до 5"),
      "estimatedHoursMin" to Schema.double(description = "Минимални часове за изпълнение"),
      "estimatedHoursMax" to Schema.double(description = "Максимални часове за изпълнение"),
      "recommendedSessions" to Schema.integer(description = "Препоръчителен брой сесии"),
      "recommendedNeedles" to Schema.array(
        items = Schema.string(),
        description = "Препоръчителни размери игли (напр. 03RL, 07CM, 17RM)"
      ),
      "recommendedVoltage" to Schema.string(description = "Препоръчителен работен волтаж"),
      "painIndex" to Schema.string(description = "Индекс на болка за тази анатомична зона"),
      "technicalAdvice" to Schema.string(description = "Професионални студийни съвети"),
      "recommendedPriceMin" to Schema.double(description = "Минимална препоръчителна цена в лева"),
      "recommendedPriceMax" to Schema.double(description = "Максимална препоръчителна цена в лева")
    )
  )

  private val model by lazy {
    Firebase.ai.generativeModel(
      modelName = "gemini-3.8-flash",
      generationConfig = generationConfig {
        responseMimeType = "application/json"
        responseSchema = assessmentSchema
      }
    )
  }

  suspend fun analyzeTattoo(description: String, bodyLocation: String, sizeCm: String): String {
    val prompt = """
      Ти си Главен Магистър Татуист на студио Hacienda Di Ink.
      Анализирай следния татуировъчен проект:
      - Описание: $description
      - Зона: $bodyLocation
      - Размер: $sizeCm
      
      Дай детайлна оценка на сложността, техническите параметри и препоръчителните игли и волтаж.
    """.trimIndent()

    return try {
      withTimeout(60_000L) {
        val response = model.generateContent(prompt)
        response.text ?: "{}"
      }
    } catch (e: TimeoutCancellationException) {
      Log.e(TAG, "Gemini generation timed out", e)
      "{\"error\": \"Времето за AI анализ изтече (timeout 60s).\"}"
    } catch (e: CancellationException) {
      throw e
    } catch (e: Exception) {
      Log.e(TAG, "Gemini generation failed", e)
      "{\"error\": \"${e.localizedMessage ?: "Грешка при генериране"}\"}"
    }
  }
}
