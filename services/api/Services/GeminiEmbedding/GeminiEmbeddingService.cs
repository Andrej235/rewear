using FluentResults;

namespace ReWear.Services.GeminiEmbedding;

record GeminiEmbeddingResponse(GeminiEmbeddingResponseEmbedding Embedding);

record GeminiEmbeddingResponseEmbedding(float[] Values);

public class GeminiEmbeddingService(HttpClient client)
{
    private readonly HttpClient http = client;

    public async Task<Result<float[]>> EmbedAsync(string text, CancellationToken ct = default)
    {
        var payload = new
        {
            content = new { parts = new[] { new { text } } },
            output_dimensionality = 1536, // MUST be the same size as specified in DataContext for embedding vectors
        };

        try
        {
            // base url is configured at HttpClient level (see Program.cs)
            using var response = await http.PostAsJsonAsync(
                "/v1beta/models/gemini-embedding-001:embedContent",
                payload,
                ct
            );
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<GeminiEmbeddingResponse>(
                cancellationToken: ct
            );

            return result!.Embedding.Values;
        }
        catch (Exception ex)
        {
            return Result.Fail<float[]>(
                new ExceptionalError("Failed to get embedding from Gemini API.", ex)
            );
        }
    }
}
