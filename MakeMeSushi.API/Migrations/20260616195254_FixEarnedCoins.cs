using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MakeMeSushi.Migrations
{
    /// <inheritdoc />
    public partial class FixEarnedCoins : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "EarnedCoins",
                table: "PomodoroSessions",
                type: "int",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "EarnedCoins",
                table: "PomodoroSessions",
                type: "bit",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }
    }
}
