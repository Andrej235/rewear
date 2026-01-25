using FluentResults;
using ReWear.Dtos.Response.InventoryItem;

namespace ReWear.Services.ModelServices.InventoryItemService;

public partial class InventoryItemService
{
    public Task<Result<AdminStockResponseDto>> GetFor(
        Guid clothingItemId,
        CancellationToken cancellationToken
    )
    {
        return clothingItemReadService.Get(
            x => new AdminStockResponseDto
            {
                ClothingItemId = x.Id,
                ClothingItemName = x.Name,
                Category = x.Category,
                InventoryItems = x.InInventory.Select(x => new AdminInventoryItemResponseDto
                {
                    Id = x.Id,
                    ClothingItemId = x.ClothingItemId,

                    Category = x.Category,
                    TopSize = x.TopSize,
                    BottomWaistSize = x.BottomWaistSize,
                    BottomLengthSize = x.BottomLengthSize,
                    ShoeSize = x.ShoeSize,

                    Condition = x.Condition,
                    Status = x.Status,
                    TimesRented = x.TimesRented,
                    LastCleanedAt = x.LastCleanedAt,
                    AddedAt = x.AddedAt,
                }),
            },
            x => x.Id == clothingItemId,
            cancellationToken: cancellationToken
        );
    }
}
