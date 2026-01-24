using FluentResults;
using ReWear.Dtos.Request.ClothingItem;

namespace ReWear.Services.ModelServices.ClothingItemService;

public partial class ClothingItemService
{
    public Task<Result> Update(UpdateClothingItemRequestDto request)
    {
        var mapped = updateMapper.Map(request);
        return updateSingleService.Update(mapped);
    }

    public async Task<Result> UpdateImage(Guid id, IFormFile imageStream)
    {
        try
        {
            await storageService.SaveAsync(
                $"clothing-items/{id}",
                imageStream.OpenReadStream(),
                imageStream.ContentType
            );
        }
        catch (Exception ex)
        {
            return Result.Fail(new Error("Failed to save image").CausedBy(ex));
        }

        return Result.Ok();
    }
}
