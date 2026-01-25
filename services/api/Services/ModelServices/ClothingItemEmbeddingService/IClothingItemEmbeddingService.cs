using FluentResults;
using Pgvector;

namespace ReWear.Services.ModelServices.ClothingItemEmbeddingService;

public interface IClothingItemEmbeddingService
{
    Task<Result> GenerateEmbedding(Guid id);
}
