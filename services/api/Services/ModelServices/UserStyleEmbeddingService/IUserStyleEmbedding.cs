using FluentResults;

namespace ReWear.Services.ModelServices.UserStyleEmbeddingService;

public interface IUserStyleEmbeddingService
{
    Task<Result> GenerateEmbedding(string userId);
}
