using ReWear.Models.Enums;

namespace ReWear.Dtos.Request.InventoryItem;

public class ChangeStatusRequestDto
{
    public Guid InventoryItemId { get; set; }
    public InventoryItemStatus NewStatus { get; set; }
}
