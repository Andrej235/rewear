namespace ReWear.Models.Enums;

public enum DeliveryBoxStatus
{
    None = 0,
    Preparing = 1 << 0,
    Shipping = 1 << 1,
    Returning = 1 << 2,
    Completed = 1 << 3,
}
