using ReWear.Dtos.Request.InventoryItem;
using ReWear.Models;
using ReWear.Models.Enums;
using ReWear.Utilities;

namespace ReWear.Services.Mapping.Request.InventoryItemMappers;

public class AddStockRequestMapper : IRequestMapper<AddStockRequestDto, IEnumerable<InventoryItem>>
{
    public IEnumerable<InventoryItem> Map(AddStockRequestDto source)
    {
        var inventoryItems = new List<InventoryItem>();
        for (int i = 0; i < source.Quantity; i++)
        {
            var inventoryItem = new InventoryItem
            {
                ClothingItemId = source.ClothingItemId,

                Category = source.Category,
                TopSize = source.TopSize,
                BottomWaistSize = source.BottomWaistSize,
                BottomLengthSize = source.BottomLengthSize,
                ShoeSize = source.ShoeSize,

                Condition = InventoryItemCondition.New,
                Status = InventoryItemStatus.Available,

                TimesRented = 0,
                LastCleanedAt = DateTime.UtcNow.AsUTC(),
                AddedAt = DateTime.UtcNow.AsUTC(),
            };
            inventoryItems.Add(inventoryItem);
        }

        return inventoryItems;
    }
}
