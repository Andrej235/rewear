using System.Security.Claims;
using FluentResults;
using ReWear.Dtos.Response.ClothingItem;
using ReWear.Models.Enums;
using ReWear.Services.Read;
using ReWear.Utilities;

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
                SecondaryStyles = x.SecondaryStyles.ToFlags(),

                Colors = x.Colors.ToFlags(),
                FitType = x.FitType,
                Season = x.Season,

                Material = x.Material,
                BrandName = x.BrandName,

                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,

                Stock = x.InInventory.Count,
                LastEmbeddingGeneratedAt = x.Embedding != null ? x.Embedding.UpdatedAt : null,
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
                SecondaryStyles = x.SecondaryStyles.ToFlags(),

                Colors = x.Colors.ToFlags(),
                FitType = x.FitType,
                Season = x.Season,

                Material = x.Material,
                BrandName = x.BrandName,

                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,

                Stock = x.InInventory.Count,
                LastEmbeddingGeneratedAt = x.Embedding != null ? x.Embedding.UpdatedAt : null,
            },
            null,
            cancellationToken: cancellationToken
        );
    }

    public async Task<Result<FullClothingItemResponseDto>> GetFullById(
        Guid id,
        CancellationToken ct
    )
    {
        var result = await readService.Get(
            x => new FullClothingItemResponseDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                ImageUrl = x.ImageUrl,

                Category = x.Category,
                GenderTarget = x.GenderTarget,

                PrimaryStyle = x.PrimaryStyle,
                SecondaryStyles = x.SecondaryStyles.ToFlags(),

                Colors = x.Colors.ToFlags(),
                FitType = x.FitType,
                Season = x.Season,

                Material = x.Material,
                BrandName = x.BrandName,

                Sizes = x
                    .InInventory.Select(i =>
                        i.Category == ClothingCategory.Top
                        || i.Category == ClothingCategory.Outerwear
                            ? i.TopSize!
                        : i.Category == ClothingCategory.Bottom
                            ? i.BottomWaistSize! + " x " + i.BottomLengthSize!
                        : i.Category == ClothingCategory.Footwear ? i.ShoeSize!
                        : null!
                    )
                    .Where(size => size != null),
            },
            x => x.Id == id,
            cancellationToken: ct
        );

        if (result.IsFailed)
            return Result.Fail(result.Errors);

        result.Value.Sizes = result.Value.Sizes.Distinct();
        return result.Value;
    }
}
