using FluentResults;

namespace ReWear.Errors;

public class Forbidden(string message) : Error(message) { }
