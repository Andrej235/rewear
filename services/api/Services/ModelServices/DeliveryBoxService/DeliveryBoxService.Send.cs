using System.Security.Claims;
using FluentResults;
using ReWear.Models.Enums;
using ReWear.Services.Read;
using ReWear.Utilities;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public partial class DeliveryBoxService
{
    public async Task<Result> Send(ClaimsPrincipal claims)
    {
        var userId = userManager.GetUserId(claims);
        if (userId is null)
            return Result.Fail("User not found");

        var userSubscriptionPlanResult = await userSubscriptionReadService.Get(
            x => new { x.SubscriptionPlan.MaxItemsPerMonth },
            x => x.UserId == userId
        );

        if (userSubscriptionPlanResult.IsFailed)
            return Result.Fail("User subscription plan not found");

        var maxItems = userSubscriptionPlanResult.Value.MaxItemsPerMonth;

        var result = await readRangeService.Get(
            box => new
            {
                box.Id,
                box.Status,
                Items = box.Items.Select(x => x.InventoryItemId),
            },
            x => x.UserId == userId,
            0,
            1,
            q => q.OrderByDescending(b => b.Month)
        );

        if (result.IsFailed || !result.Value.Any())
            return Result.Fail("No delivery boxes found");

        var box = result.Value.First();

        if (box.Status != DeliveryBoxStatus.None)
            return Result.Fail("Box has already been sent or is being prepared");

        if (box.Items.Count() > maxItems)
            return Result.Fail(
                $"Cannot send a box with {box.Items.Count()} items. Your plan allows up to {maxItems} items per month."
            );

        var now = DateTime.UtcNow.AsUTC();
        var boxUpdateResult = await deliveryBoxUpdateService.Update(
            x => x.Id == box.Id,
            x =>
                x.SetProperty(b => b.Status, DeliveryBoxStatus.Preparing)
                    .SetProperty(b => b.SentAt, now)
        );

        if (boxUpdateResult.IsFailed)
            return Result.Fail("Failed to update delivery box status");

        await inventoryItemUpdateService.Update(
            x => box.Items.Contains(x.Id),
            x => x.SetProperty(x => x.TimesRented, y => y.TimesRented + 1)
        );

        return Result.Ok();
    }
}
