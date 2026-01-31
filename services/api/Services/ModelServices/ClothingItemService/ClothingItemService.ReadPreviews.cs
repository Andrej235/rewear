using System.Linq.Expressions;
using System.Security.Claims;
using FluentResults;
using Resend;
using ReWear.Dtos.Request.ClothingItem;
using ReWear.Dtos.Response.ClothingItem;
using ReWear.Models;
using ReWear.Models.Enums;
using ReWear.Services.Read;
using ReWear.Utilities;

namespace ReWear.Services.ModelServices.ClothingItemService;

public partial class ClothingItemService
{
    public async Task<Result<IEnumerable<ClothingItemPreviewResponseDto>>> GetPreviews(
        ClaimsPrincipal userClaims,
        GetClothingItemFiltersRequestDto filters,
        CancellationToken ct
    )
    {
        var userId = userManager.GetUserId(userClaims);
        if (userId is null)
            return Result.Fail("User not found");

        var userSizesResult = !filters.OnlyInStock
            ? null
            : await userSizeReadService.Get(x => x.UserId == userId, cancellationToken: ct);

        if (userSizesResult is not null && userSizesResult.IsFailed)
            return Result.Fail(userSizesResult.Errors);

        var userSizes = userSizesResult?.Value ?? [];

        var items = await readRangeService.Get(
            x => new ClothingItemPreviewResponseDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                ImageUrl = x.ImageUrl,
            },
            filters.Strict ? GetStrictWhere(filters, userSizes) : GetWhere(filters, userSizes),
            filters.Offset,
            filters.Limit,
            filters.Strict
                ? q => q.OrderByDescending(x => x.Name)
                : q => q.OrderByDescending(GetOrderByScore(filters)).ThenByDescending(x => x.Name),
            ct
        );

        return items;
    }

    static Expression<Func<ClothingItem, int>> GetOrderByScore(
        GetClothingItemFiltersRequestDto filters
    )
    {
        var colorsMask = filters.Colors?.FromFlags() ?? 0;
        var stylesMask = filters.Styles?.FromFlags() ?? 0;
        var fitMask = filters.FitTypes?.FromFlags() ?? 0;
        var categoryMask = filters.Categories?.FromFlags() ?? 0;
        var genderMask = filters.Gender?.FromFlags() ?? 0;
        var materialMask = filters.Materials?.FromFlags() ?? 0;

        return ci =>
            // Name match (bonus, not required)
            (filters.Name != null && ci.Name.ToLower().Contains(filters.Name.ToLower()) ? 35 : 0)
            + (
                filters.Name != null && ci.Description.ToLower().Contains(filters.Name.ToLower())
                    ? 10
                    : 0
            )
            // Strong style match
            + (stylesMask != 0 && (ci.PrimaryStyle & stylesMask) != 0 ? 40 : 0)
            // Secondary style match (flags)
            + (stylesMask != 0 && (ci.SecondaryStyles & stylesMask) != 0 ? 20 : 0)
            // Color match (flags)
            + (colorsMask != 0 && (ci.Colors & colorsMask) != 0 ? 18 : 0)
            // Fit match (flags)
            + (fitMask != 0 && (ci.FitType & fitMask) != 0 ? 25 : 0)
            // Season match
            + (filters.Season != null && ci.Season == filters.Season ? 12 : 0)
            // Material match
            + (materialMask != 0 && (ci.Material & materialMask) != 0 ? 10 : 0);
    }

    static Expression<Func<ClothingItem, bool>> GetWhere(
        GetClothingItemFiltersRequestDto filters,
        IEnumerable<UserSize> userSizes
    )
    {
        var topSizes = userSizes
            .Where(x => x.SizeType == SizeType.Top)
            .Select(x => x.Label)
            .ToList();

        var bottomWaistSizes = userSizes
            .Where(x => x.SizeType == SizeType.BottomWaist)
            .Select(x => x.Label)
            .ToList();

        var bottomLengthSizes = userSizes
            .Where(x => x.SizeType == SizeType.BottomLength)
            .Select(x => x.Label)
            .ToList();

        var shoeSizes = userSizes
            .Where(x => x.SizeType == SizeType.Shoe)
            .Select(x => x.Label)
            .ToList();

        return ci =>
            ci.IsActive
            && (
                !filters.OnlyInStock
                || ci.InInventory.Any(ii =>
                    ii.Status == InventoryItemStatus.Available
                    && ii.Condition != InventoryItemCondition.Damaged
                    && (
                        (
                            (
                                ci.Category == ClothingCategory.Top
                                || ci.Category == ClothingCategory.Outerwear
                            )
                            && ii.TopSize != null
                            && topSizes.Contains(ii.TopSize)
                        )
                        || (
                            ci.Category == ClothingCategory.Bottom
                            && ii.BottomWaistSize != null
                            && ii.BottomLengthSize != null
                            && bottomWaistSizes.Contains(ii.BottomWaistSize)
                            && bottomLengthSizes.Contains(ii.BottomLengthSize)
                        )
                        || (
                            ci.Category == ClothingCategory.Footwear
                            && ii.ShoeSize != null
                            && shoeSizes.Contains(ii.ShoeSize)
                        )
                    )
                )
            )
            && (filters.Gender == null || (ci.GenderTarget & filters.Gender.FromFlags()) != 0)
            && (filters.Categories == null || (ci.Category & filters.Categories.FromFlags()) != 0);
    }

    static Expression<Func<ClothingItem, bool>> GetStrictWhere(
        GetClothingItemFiltersRequestDto filters,
        IEnumerable<UserSize> userSizes
    )
    {
        var topSizes = userSizes
            .Where(x => x.SizeType == SizeType.Top)
            .Select(x => x.Label)
            .ToList();

        var bottomWaistSizes = userSizes
            .Where(x => x.SizeType == SizeType.BottomWaist)
            .Select(x => x.Label)
            .ToList();

        var bottomLengthSizes = userSizes
            .Where(x => x.SizeType == SizeType.BottomLength)
            .Select(x => x.Label)
            .ToList();

        var shoeSizes = userSizes
            .Where(x => x.SizeType == SizeType.Shoe)
            .Select(x => x.Label)
            .ToList();

        var colorsMask = filters.Colors?.FromFlags() ?? 0;
        var stylesMask = filters.Styles?.FromFlags() ?? 0;
        var fitMask = filters.FitTypes?.FromFlags() ?? 0;
        var categoryMask = filters.Categories?.FromFlags() ?? 0;
        var genderMask = filters.Gender?.FromFlags() ?? 0;
        var materialMask = filters.Materials?.FromFlags() ?? 0;

        return ci =>
            ci.IsActive
            && (
                !filters.OnlyInStock
                || ci.InInventory.Any(ii =>
                    ii.Status == InventoryItemStatus.Available
                    && ii.Condition != InventoryItemCondition.Damaged
                    && (
                        (
                            (
                                ci.Category == ClothingCategory.Top
                                || ci.Category == ClothingCategory.Outerwear
                            )
                            && ii.TopSize != null
                            && topSizes.Contains(ii.TopSize)
                        )
                        || (
                            ci.Category == ClothingCategory.Bottom
                            && ii.BottomWaistSize != null
                            && ii.BottomLengthSize != null
                            && bottomWaistSizes.Contains(ii.BottomWaistSize)
                            && bottomLengthSizes.Contains(ii.BottomLengthSize)
                        )
                        || (
                            ci.Category == ClothingCategory.Footwear
                            && ii.ShoeSize != null
                            && shoeSizes.Contains(ii.ShoeSize)
                        )
                    )
                )
            )
            // Gender
            && (filters.Gender == null || (ci.GenderTarget & filters.Gender.FromFlags()) != 0)
            // Category
            && (filters.Categories == null || (ci.Category & filters.Categories.FromFlags()) != 0)
            // Name
            && (filters.Name == null || ci.Name.ToLower().Contains(filters.Name.ToLower()))
            // Style
            && (
                stylesMask == 0
                || (ci.PrimaryStyle & stylesMask) != 0
                || (ci.SecondaryStyles & stylesMask) != 0
            )
            // Color
            && (colorsMask == 0 || (ci.Colors & colorsMask) != 0)
            // Fit
            && (fitMask == 0 || (ci.FitType & fitMask) != 0)
            // Season
            && (filters.Season == null || ci.Season == filters.Season)
            // Material
            && (materialMask == 0 || (ci.Material & materialMask) != 0);
    }
}
