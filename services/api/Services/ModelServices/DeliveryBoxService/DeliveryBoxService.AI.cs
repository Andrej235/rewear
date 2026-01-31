using System.Security.Claims;
using FluentResults;
using Pgvector.EntityFrameworkCore;
using ReWear.Models;
using ReWear.Models.Enums;
using ReWear.Services.Read;
using ReWear.Utilities;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public partial class DeliveryBoxService
{
    public async Task<Result> FillLatestBoxWithAI(ClaimsPrincipal claims)
    {
        var userId = userManager.GetUserId(claims);
        if (userId is null)
            return Result.Fail("User not found");

        var today = DateTime.UtcNow.AsUTC();
        var userResult = await userReadService.Get(
            x => new
            {
                x.Sizes,
                UserSubscriptionPlan = x
                    .Subscriptions.Where(x => x.EndDate > today && x.IsActive)
                    .OrderByDescending(x => x.SubscriptionPlan.MonthlyPrice)
                    .First()
                    .SubscriptionPlan,
            },
            x => x.Id == userId
        );

        if (userResult.IsFailed)
            return Result.Fail(userResult.Errors);

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

        if (latestBox.Status != DeliveryBoxStatus.None)
            return Result.Fail("Cannot add items to a box that has been processed");

        var subscriptionPlan = userResult.Value.UserSubscriptionPlan;
        if (subscriptionPlan is null)
            return Result.Fail("User does not have an active subscription");

        var currentItemCount = latestBox.Items.Count();
        if (currentItemCount >= subscriptionPlan.MaxItemsPerMonth)
            return Result.Fail("The latest box is already full");

        var itemsToAddCount = subscriptionPlan.MaxItemsPerMonth - currentItemCount;

        var existingItemIds = latestBox.Items;
        var userSizes = userResult.Value.Sizes;
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
                    && !existingItemIds.Any(id => id == ci.Id) // exclude items already in the box
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
            itemsToAddCount,
            q => q.OrderByDescending(ci => ci.Embedding!.Embedding.CosineDistance(userEmbedding))
        );

        if (itemsToAdd.IsFailed)
            return Result.Fail(itemsToAdd.Errors);

        if (!itemsToAdd.Value.Any())
            return Result.Fail("No suitable items found to add to the box");

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

        var invItemIds = itemsToAdd.Value.Select(i => i.InventoryItem.Id);
        await inventoryItemUpdateService.Update(
            x => invItemIds.Contains(x.Id),
            x => x.SetProperty(x => x.Status, InventoryItemStatus.Reserved)
        );

        if (result.IsFailed)
            return Result.Fail(result.Errors);

        return Result.Ok();
    }
}
