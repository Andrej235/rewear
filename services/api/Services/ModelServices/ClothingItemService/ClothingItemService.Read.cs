using FluentResults;
using ReWear.Dtos.Response.ClothingItem;

namespace ReWear.Services.ModelServices.ClothingItemService;

public partial class ClothingItemService
{
    public Task<Result<AdminClothingItemResponseDto>> GetById(
        Guid id,
        CancellationToken cancellationToken
    )
    {
        return readService.Get(
            x => new AdminClothingItemResponseDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                ImageUrl = x.ImageUrl,

                Category = x.Category,
                GenderTarget = x.GenderTarget,

                PrimaryStyle = x.PrimaryStyle,
                SecondaryStyles = x.SecondaryStyles,

                Colors = x.Colors,
                FitType = x.FitType,
                Season = x.Season,

                Material = x.Material,
                BrandName = x.BrandName,

                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,

                Stock = x.InInventory.Count,
            },
            x => x.Id == id,
            cancellationToken: cancellationToken
        );
    }

    public Task<Result<IEnumerable<AdminClothingItemResponseDto>>> GetAll(
        CancellationToken cancellationToken
    )
    {
        return readRangeService.Get(
            x => new AdminClothingItemResponseDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                ImageUrl = x.ImageUrl,

                Category = x.Category,
                GenderTarget = x.GenderTarget,

                PrimaryStyle = x.PrimaryStyle,
                SecondaryStyles = x.SecondaryStyles,

                Colors = x.Colors,
                FitType = x.FitType,
                Season = x.Season,

                Material = x.Material,
                BrandName = x.BrandName,

                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,

                Stock = x.InInventory.Count,
            },
            null,
            cancellationToken: cancellationToken
        );
    }
}
