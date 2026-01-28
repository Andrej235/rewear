using FluentResults;
using Pgvector;

namespace ReWear.Services.ModelServices.UserStyleEmbeddingService;

public interface IUserStyleEmbeddingService
{
    Task<Result<Vector>> GenerateEmbedding(string userId);
    Task<Result<Vector>> GetOrGenerateEmbedding(string userId);
}
