using FluentResults;
using ReWear.Dtos.Request.ClothingItem;

namespace ReWear.Services.ModelServices.ClothingItemService;

public partial class ClothingItemService
{
    public async Task<Result> Update(UpdateClothingItemRequestDto request)
    {
        var mapped = updateMapper.Map(request);
        mapped.ImageUrl = await storageService.GetPublicUrlAsync($"clothing-items/{mapped.Id}");
        return await updateSingleService.Update(mapped);
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
