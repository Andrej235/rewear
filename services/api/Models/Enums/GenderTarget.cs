namespace ReWear.Models.Enums;

public enum GenderTarget
{
    None = 0,
    Male = 1 << 0,
    Female = 1 << 1,
    Unisex = 1 << 2,
}
