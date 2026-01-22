using ReWear.Models.Enums;

namespace ReWear.Models;

public class DeliveryBoxItem
{
    public Guid DeliveryBoxId { get; set; }
    public DeliveryBox DeliveryBox { get; set; } = null!;

    public Guid InventoryItemId { get; set; }
    public InventoryItem InventoryItem { get; set; } = null!;

    public bool ChosenByAi { get; set; }
    public InventoryItemCondition ConditionOnSend { get; set; }
    public InventoryItemCondition ConditionOnReturn { get; set; }
}
