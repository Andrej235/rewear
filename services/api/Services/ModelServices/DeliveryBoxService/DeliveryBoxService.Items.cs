using System.Security.Claims;
using FluentResults;
using ReWear.Models;
using ReWear.Models.Enums;
using ReWear.Services.Read;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public partial class DeliveryBoxService
{
    public async Task<Result> AddItemToLatestBox(
        ClaimsPrincipal claims,
        Guid clothingItemId,
        string size
    )
    {
        var userId = userManager.GetUserId(claims);
        if (userId is null)
            return Result.Fail("User not found");

        var latestBoxResult = await readRangeService.Get(
            x => new { x.Id, x.Status },
            x => x.UserId == userId,
            0,
            1,
            q => q.OrderByDescending(b => b.Month)
        );

        if (latestBoxResult.IsFailed || !latestBoxResult.Value.Any())
            return Result.Fail("No delivery boxes found");

        var latestBox = latestBoxResult.Value.First();

        var inventoryItemResult = await inventoryItemReadService.Get(
            x => new { x.Id, x.Condition },
            i =>
                i.ClothingItemId == clothingItemId
                && (
                    (
                        (
                            i.Category == ClothingCategory.Top
                            || i.Category == ClothingCategory.Outerwear
                        )
                        && i.TopSize == size
                    )
                    || (
                        i.Category == ClothingCategory.Bottom
                        && (i.BottomWaistSize + " x " + i.BottomLengthSize) == size
                    )
                    || (i.Category == ClothingCategory.Footwear && i.ShoeSize == size)
                )
                && i.Status == InventoryItemStatus.Available
                && i.Condition != InventoryItemCondition.Damaged,
            0,
            1,
            q => q.OrderBy(i => i.Condition).ThenBy(i => i.TimesRented) // Prefer better condition and less rented items
        );

        if (inventoryItemResult.IsFailed || !inventoryItemResult.Value.Any())
            return Result.Fail("No suitable inventory item found");

        var inventoryItem = inventoryItemResult.Value.First();

        var itemCreateResult = await createItemService.Add(
            new DeliveryBoxItem
            {
                InventoryItemId = inventoryItem.Id,
                DeliveryBoxId = latestBox.Id,
                ConditionOnSend = inventoryItem.Condition,
                ConditionOnReturn = InventoryItemCondition.None,
                ChosenByAi = false,
            }
        );

        if (itemCreateResult.IsFailed)
            return Result.Fail(itemCreateResult.Errors);

        await inventoryItemUpdateService.Update(
            x => x.Id == inventoryItem.Id,
            x => x.SetProperty(x => x.Status, InventoryItemStatus.Reserved)
        );

        return Result.Ok();
    }

    public async Task<Result> RemoveItem(ClaimsPrincipal claims, Guid inventoryItemId)
    {
        var userId = userManager.GetUserId(claims);
        if (userId is null)
            return Result.Fail("User not found");

        // even though we have the inventoryItemId, we still need to find the latest box for the user to protect against deleting from other boxes
        var latestBoxResult = await readRangeService.Get(
            x => new { x.Id, x.Status },
            x => x.UserId == userId,
            0,
            1,
            q => q.OrderByDescending(b => b.Month)
        );

        if (latestBoxResult.IsFailed || !latestBoxResult.Value.Any())
            return Result.Fail("No delivery boxes found");

        var latestBox = latestBoxResult.Value.First();

        var itemDeleteResult = await deleteItemService.Delete(x =>
            x.DeliveryBoxId == latestBox.Id && x.InventoryItemId == inventoryItemId
        );

        if (itemDeleteResult.IsFailed)
            return Result.Fail(itemDeleteResult.Errors);

        await inventoryItemUpdateService.Update(
            x => x.Id == inventoryItemId,
            x => x.SetProperty(x => x.Status, InventoryItemStatus.Available)
        );

        return Result.Ok();
    }
}
