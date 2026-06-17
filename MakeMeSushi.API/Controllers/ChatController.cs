using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;

namespace MakeMeSushi.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        // HttpClient'i DI (Dependency Injection) üzerinden alıyoruz
        public ChatController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        [HttpPost("maneki")]
        [Authorize] // Sadece giriş yapmış kullanıcılar chat yapabilsin
        public async Task<IActionResult> AskManeki([FromBody] ChatRequest request)
        {
            var ollamaUrl = "http://localhost:11434/api/chat";

            // TEZİNDE BELİRTTİĞİN FEW-SHOT SİSTEM PROMPTU
            var systemPrompt = @"You are Maneki, a wise and encouraging virtual sushi chef. 
Your goal is to act as a dynamic productivity coach. 
Rules:
1. Always be empathetic and cozy.
3. Keep your responses VERY concise, strictly 2 to 3 sentences (around 35 words).
4. Never give generic, clinical, or robotic advice. Keep the cozy immersion.

Examples of your personality:
User: I finished my 25 minutes!
Maneki: Excellent work! Your focus is as sharp as a chef's knife. Let's roll up another great session!

User: I had to cancel the timer, I got distracted.
Maneki: Don't worry, even the best rice needs time to rest. Take a deep breath, and we'll prepare a fresh batch when you're ready.

User: I am feeling tired today.
Maneki: A good chef knows when to step away from the cutting board. Have some tea, rest your eyes, and come back refreshed!";

            // Ollama'ya gönderilecek JSON paketi
            var payload = new
            {
                model = "phi3", // İndirdiğin phi-3 modelinin tam adı (Ollama'daki karşılığı)
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = request.Message }
                },
                stream = false // Frontend'e anında tek parça (130ms TTFT) metin dönmesi için stream kapalı
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync(ollamaUrl, content);
                response.EnsureSuccessStatusCode();

                var responseString = await response.Content.ReadAsStringAsync();
                using var jsonDoc = JsonDocument.Parse(responseString);
                var reply = jsonDoc.RootElement.GetProperty("message").GetProperty("content").GetString();

                return Ok(new { reply });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { reply = "My oven is a bit broken right now, chef! (Ollama connection error)" });
            }
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; }
    }
}