using FluentResults;
using ReWear.Models.Enums;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public partial class DeliveryBoxService
{
    public Task<Result> UpdateStatus(Guid boxId, DeliveryBoxStatus newStatus)
    {
        if (newStatus == DeliveryBoxStatus.None)
            return Task.FromResult(Result.Fail("Invalid status"));

        return deliveryBoxUpdateService.Update(
            x => x.Id == boxId && x.Status != DeliveryBoxStatus.None,
            x => x.SetProperty(x => x.Status, newStatus)
        );
    }

    public async Task<Result> UpdateItemsStatusBulk(Guid boxId, InventoryItemStatus newStatus)
    {
        if (newStatus == InventoryItemStatus.None)
            return Result.Fail("Invalid status");

        var items = await readService.Get(
            x => x.Items.Select(x => x.InventoryItemId),
            x => x.Id == boxId
        );

        if (items.IsFailed)
            return Result.Fail(items.Errors);

        return await inventoryItemUpdateService.Update(
            x => items.Value.Contains(x.Id),
            x => x.SetProperty(x => x.Status, newStatus)
        );
    }
}
