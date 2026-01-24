using FluentResults;
using ReWear.Dtos.Request.ClothingItem;
using ReWear.Dtos.Response.ClothingItem;

namespace ReWear.Services.ModelServices.ClothingItemService;

public partial class ClothingItemService
{
    public async Task<Result<AdminClothingItemResponseDto>> Create(
        CreateClothingItemRequestDto request,
        IFormFile imageStream
    )
    {
        var mapped = createMapper.Map(request);
        var createResult = await createService.Add(mapped);

        if (createResult.IsFailed)
            return Result.Fail(createResult.Errors);

        try
        {
            await storageService.SaveAsync(
                $"clothing-items/{createResult.Value.Id}",
                imageStream.OpenReadStream(),
                imageStream.ContentType
            );
        }
        catch (Exception ex)
        {
            return Result.Fail(new Error("Failed to save image").CausedBy(ex));
        }

        var imageUrl = await storageService.GetPublicUrlAsync(
            $"clothing-items/{createResult.Value.Id}"
        );

        var updateResult = await updateService.Update(
            x => x.Id == createResult.Value.Id,
            x => x.SetProperty(x => x.ImageUrl, imageUrl)
        );
        if (updateResult.IsFailed)
            return Result.Fail(updateResult.Errors);

        return new AdminClothingItemResponseDto
        {
            Id = createResult.Value.Id,
            Name = createResult.Value.Name,
            Description = createResult.Value.Description,
            ImageUrl = imageUrl,

            Category = createResult.Value.Category,
            GenderTarget = createResult.Value.GenderTarget,

            PrimaryStyle = createResult.Value.PrimaryStyle,
            SecondaryStyles = createResult.Value.SecondaryStyles,

            Colors = createResult.Value.Colors,
            FitType = createResult.Value.FitType,
            Season = createResult.Value.Season,

            Material = createResult.Value.Material,
            BrandName = createResult.Value.BrandName,

            IsActive = createResult.Value.IsActive,
            CreatedAt = createResult.Value.CreatedAt,

            Stock = 0,
        };
    }
}
