using System.Security.Claims;
using FluentResults;
using Pgvector.EntityFrameworkCore;
using ReWear.Models;
using ReWear.Models.Enums;
using ReWear.Services.Read;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public partial class DeliveryBoxService
{
    public async Task<Result> FillLatestBoxWithAI(ClaimsPrincipal claims)
    {
        var userId = userManager.GetUserId(claims);
        if (userId is null)
            return Result.Fail("User not found");

        var userSizesResult = await userSizeReadService.Get(x => x.UserId == userId);

        if (userSizesResult.IsFailed)
            return Result.Fail(userSizesResult.Errors);

        var userEmbeddingResult = await userStyleEmbeddingService.GetOrGenerateEmbedding(userId);
        if (userEmbeddingResult.IsFailed)
            return Result.Fail(userEmbeddingResult.Errors);

        var latestBoxResult = await readRangeService.Get(
            x => new
            {
                x.Id,
                x.Status,
                Items = x.Items.Select(i => i.InventoryItem.ClothingItemId),
            },
            x => x.UserId == userId,
            0,
            1,
            q => q.OrderByDescending(b => b.Month)
        );

        if (latestBoxResult.IsFailed || !latestBoxResult.Value.Any())
            return Result.Fail("No delivery boxes found");

        var latestBox = latestBoxResult.Value.First();
        var userSizes = userSizesResult?.Value ?? [];
        var userEmbedding = userEmbeddingResult.Value;

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

        var itemsToAdd = await clothingItemReadService.Get(
            ci => new
            {
                InventoryItem = ci.InInventory.First(ii =>
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
                ),
            },
            ci =>
                ci.IsActive
                && ci.InInventory.Any(ii =>
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
                ),
            0,
            5, // todo: base this off of users subscription plan and current box items count
            q => q.OrderByDescending(ci => ci.Embedding!.Embedding.CosineDistance(userEmbedding))
        );

        if (itemsToAdd.IsFailed)
            return Result.Fail(itemsToAdd.Errors);

        var result = await createItemRangeService.Add(
            itemsToAdd.Value.Select(x => new DeliveryBoxItem
            {
                DeliveryBoxId = latestBox.Id,
                InventoryItemId = x.InventoryItem.Id,
                ConditionOnSend = x.InventoryItem.Condition,
                ConditionOnReturn = InventoryItemCondition.None,
                ChosenByAi = true,
            })
        );

        if (result.IsFailed)
            return Result.Fail(result.Errors);

        return Result.Ok();
    }
}
