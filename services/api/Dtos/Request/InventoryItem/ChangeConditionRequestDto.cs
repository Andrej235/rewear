using ReWear.Models.Enums;

namespace ReWear.Dtos.Request.InventoryItem;

public class ChangeConditionRequestDto
{
    public Guid InventoryItemId { get; set; }
    public InventoryItemCondition NewCondition { get; set; }
}
