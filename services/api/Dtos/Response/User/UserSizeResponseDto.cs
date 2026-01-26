using ReWear.Models.Enums;

namespace ReWear.Dtos.Response.User;

public class UserSizeResponseDto
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public SizeType SizeType { get; set; }
}
