$(function() {

    // ----------- EXERCISE 1 -----------
    function computeRowStats(row) {
        let abs = 0;
        let par = 0;

        let tds = row.find("td");

        // S and P columns: index 2 → 13
        for (let i = 2; i <= 13; i++) {
            let val = tds.eq(i).text().trim();

            if ((i - 2) % 2 === 0) {
                // S column (presence)
                if (val !== "✓") abs++;
            } else {
                // P column
                if (val === "✓") par++;
            }
        }

        // Write results
        tds.eq(14).text(abs);
        tds.eq(15).text(par);

        // Message
        let msg = "";
        if (abs >= 5) msg = "Excluded – too many absences";
        else if (abs >= 3) msg = "Warning – attendance low";
        else msg = "Good attendance";

        tds.eq(16).text(msg);

        // Row color
        row.removeClass("row-green row-yellow row-red");
        if (abs < 3) row.addClass("row-green");
        else if (abs <= 4) row.addClass("row-yellow");
        else row.addClass("row-red");
    }

    // Compute stats for initial row
    $("#attendanceTable tbody tr").each(function() {
        computeRowStats($(this));
    });


    // ----------- EXERCISE 2 + 3 -----------
    $("#studentForm").on("submit", function(e) {
        e.preventDefault();

        let last = $("#lastName").val().trim();
        let first = $("#firstName").val().trim();

        $("#errorMsg").text("");
        $("#successMsg").text("");

        if (last === "" || first === "") {
            $("#errorMsg").text("Both names are required.");
            return;
        }

        // Build new row
        let row = $("<tr></tr>");

        row.append(<td>${last}</td>);
        row.append(<td>${first}</td>);

        // Default values ✗ ✗ for 6 sessions
        for (let i = 0; i < 6; i++) {
            row.append("<td>✗</td>");
            row.append("<td>✗</td>");
        }

        row.append('<td class="abs"></td>');
        row.append('<td class="par"></td>');
        row.append('<td class="msg"></td>');

        // Add to table
        $("#attendanceTable tbody").append(row);

        // compute stats again
        computeRowStats(row);

        $("#successMsg").text("Student added successfully.");
        $("#studentForm")[0].reset();
    });

});