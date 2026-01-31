using ReWear.Dtos.Response.InventoryItem;
using ReWear.Models.Enums;

namespace ReWear.Dtos.Response.DeliveryBox;

public class AdminDeliveryBoxItemResponseDto
{
    public bool ChosenByAi { get; set; }
    public InventoryItemCondition ConditionOnSend { get; set; }
    public InventoryItemCondition ConditionOnReturn { get; set; }

    public Guid ClothingItemId { get; set; }
    public string ClothingItemName { get; set; } = null!;

    public AdminInventoryItemResponseDto InventoryItem { get; set; } = null!;
}
