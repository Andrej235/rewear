using FluentResults;

namespace ReWear.Services.ModelServices.InventoryItemService;

public partial class InventoryItemService
{
    public Task<Result> Delete(Guid inventoryItemId) =>
        deleteService.Delete(x => x.Id == inventoryItemId);
}
