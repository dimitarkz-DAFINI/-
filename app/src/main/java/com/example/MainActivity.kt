package com.example

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.viewinterop.AndroidView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // МАНДАТНО: Инициализация на App Check преди UI, ViewModels или Firebase операции
    configureAppCheck(this, intent)

    enableEdgeToEdge()
    setContent {
      StudioPwaScreen()
    }
  }
}

class AndroidTattooAiBridge(private val webView: WebView) {
  private val tattooAiService = TattooAiService()

  @JavascriptInterface
  fun analyzeProject(description: String, bodyLocation: String, sizeCm: String, callbackJs: String) {
    CoroutineScope(Dispatchers.IO).launch {
      val jsonResult = tattooAiService.analyzeTattoo(description, bodyLocation, sizeCm)
      // Връщане на резултата към React през JavaScript
      CoroutineScope(Dispatchers.Main).launch {
        val safeJson = jsonResult.replace("'", "\\'")
        webView.evaluateJavascript("$callbackJs('$safeJson');", null)
      }
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun StudioPwaScreen() {
  var webViewInstance by remember { mutableStateOf<WebView?>(null) }

  BackHandler(enabled = webViewInstance?.canGoBack() == true) {
    webViewInstance?.goBack()
  }

  AndroidView(
    factory = { context ->
      WebView(context).apply {
        layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT
        )
        setBackgroundColor(android.graphics.Color.parseColor("#121212"))

        settings.apply {
          javaScriptEnabled = true
          domStorageEnabled = true
          databaseEnabled = true
          allowFileAccess = true
          allowContentAccess = true
          cacheMode = WebSettings.LOAD_DEFAULT
          useWideViewPort = true
          loadWithOverviewMode = true
          displayZoomControls = false
          builtInZoomControls = false
          mediaPlaybackRequiresUserGesture = false
        }

        webViewClient = object : WebViewClient() {}
        webChromeClient = object : WebChromeClient() {}

        // Инжектиране на моста за Gemini AI Logic
        addJavascriptInterface(AndroidTattooAiBridge(this), "AndroidTattooAi")

        loadUrl("file:///android_asset/www/index.html")
        webViewInstance = this
      }
    },
    modifier = Modifier
      .fillMaxSize()
      .background(Color(0xFF121212))
      .statusBarsPadding()
      .testTag("studio_pwa_webview")
  )
}
