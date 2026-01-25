using FluentResults;
using ReWear.Dtos.Request.ClothingItem;

namespace ReWear.Services.ModelServices.ClothingItemService;

public partial class ClothingItemService
{
    public async Task<Result> Update(UpdateClothingItemRequestDto request)
    {
        var mapped = updateMapper.Map(request);
        mapped.ImageUrl = await storageService.GetPublicUrlAsync($"clothing-items/{mapped.Id}");

        var updateResult = await updateSingleService.Update(mapped);
        if (updateResult.IsFailed)
            return Result.Fail(updateResult.Errors);

        var embeddingResult = await embeddingService.GenerateEmbedding(mapped.Id);
        if (embeddingResult.IsFailed)
            return Result.Fail(embeddingResult.Errors);

        return Result.Ok();
    }

    public async Task<Result> UpdateImage(Guid id, IFormFile imageStream)
    {
        try
        {
            // overwrite existing image
            await storageService.SaveAsync(
                $"clothing-items/{id}",
                imageStream.OpenReadStream(),
                imageStream.ContentType
            );
        }
        catch (Exception ex)
        {
            return Result.Fail(new Error("Failed to save image: " + ex.Message).CausedBy(ex));
        }

        return Result.Ok();
    }
}
