namespace ReWear.Models.Enums;

public enum Gender
{
    None = 0,
    Male = 1 << 0,
    Female = 1 << 1,
    Other = 1 << 2,
};
