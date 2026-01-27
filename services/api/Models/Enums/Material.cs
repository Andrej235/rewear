namespace ReWear.Models.Enums;

public enum Material
{
    None = 0,
    Cotton = 1 << 0,
    Polyester = 1 << 1,
    Wool = 1 << 2,
    Silk = 1 << 3,
    Denim = 1 << 4,
    Leather = 1 << 5,
    Linen = 1 << 6,
    Nylon = 1 << 7,
    Spandex = 1 << 8,
    Rayon = 1 << 9,
}
