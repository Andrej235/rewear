using System.Security.Claims;
using FluentResults;
using Resend;
using ReWear.Dtos.Response.ClothingItem;
using ReWear.Models;
using ReWear.Models.Enums;
using ReWear.Services.Read;

namespace ReWear.Services.ModelServices.ClothingItemService;

public partial class ClothingItemService
{
    public async Task<Result<IEnumerable<ClothingItemPreviewResponseDto>>> GetPreviews(
        ClaimsPrincipal userClaims,
        bool onlyInStock,
        int offset,
        int limit,
        CancellationToken ct
    )
    {
        var userId = userManager.GetUserId(userClaims);
        if (userId is null)
            return Result.Fail("User not found");

        var userSizesResult = !onlyInStock
            ? null
            : await userSizeReadService.Get(x => x.UserId == userId, cancellationToken: ct);

        if (userSizesResult is not null && userSizesResult.IsFailed)
            return Result.Fail(userSizesResult.Errors);

        var userSizes = userSizesResult?.Value ?? [];

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

        var items = await readRangeService.Get(
            x => new ClothingItemPreviewResponseDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                ImageUrl = x.ImageUrl,
            },
            ci =>
                ci.IsActive
                && (
                    !onlyInStock
                    || ci.InInventory.Any(ii =>
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
                ),
            offset,
            limit,
            q => q.OrderBy(x => x.Id),
            ct
        );

        return items;
    }
}
