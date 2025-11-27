
// jQuery 
document.addEventListener('DOMContentLoaded', function () {

  // helpers
  function isPresentCell(text) {
    if (!text) return false;
    text = text.toString().trim();
    return text === '✓' || /^yes$/i.test(text);
  }
  function isParticipationCell(text) {
    if (!text) return false;
    text = text.toString().trim();
    return text === '✓' || /^yes$/i.test(text);
  }

  function getRows() {
    return $('#attendance-table tbody tr');
  }

  // update a single row: absences, participation, message, classes
  function updateRow($tr) {
    const tds = $tr.find('td');
    // ensure expected columns exist
    if (tds.length < 17) return;

    // Count absence (S columns at indices 2,4,...,12) and participation (3,5,...,13)
    let abs = 0, part = 0;
    for (let i = 2; i <= 12; i += 2) {
      if (!isPresentCell(tds.eq(i).text())) abs++;
    }
    for (let i = 3; i <= 13; i += 2) {
      if (isParticipationCell(tds.eq(i).text())) part++;
    }

    // Write numeric columns (14 = Absences, 15 = Participation)
    tds.eq(14).text(abs);
    tds.eq(15).text(part);

    // Message logic (exact phrases requested)
    let message = '';
    if (abs < 3) message = 'Good attendance';
    else if (abs >= 3 && abs <= 4) message = 'Warning: low attendance';
    else message = 'Excluded – too many absences';

    tds.eq(16).text(message);

    // Coloring
    $tr.removeClass('green-row yellow-row red-row');
    if (abs < 3) $tr.addClass('green-row');
    else if (abs >= 3 && abs <= 4) $tr.addClass('yellow-row');
    else $tr.addClass('red-row');
  }

  // update all rows
  function updateAll() {
    getRows().each(function () { updateRow($(this)); });
  }

  // bind row events (hover highlight, click alert, contenteditable blur)
  function bindRow($tr) {
    $tr.on('mouseenter', function () { $(this).addClass('hover'); });
    $tr.on('mouseleave', function () { $(this).removeClass('hover'); });

    $tr.on('click', function (e) {
      // prevent click when editing a contenteditable cell
      if ($(e.target).is('[contenteditable]')) return;
      const lname = $(this).find('td').eq(0).text();
      const fname = $(this).find('td').eq(1).text();
      const abs = $(this).find('td').eq(14).text();
      alert(fname + ' ' + lname + ' — Absences: ' + abs);
    });

    // when an editable cell loses focus, normalize and update
    $tr.find('[contenteditable=true]').on('blur', function () {
      if ($(this).text().trim() === '') $(this).text('—');
      updateRow($tr);
    });
  }

  // bind all existing rows
  function bindAllRows() {
    getRows().each(function () { bindRow($(this)); });
  }

  // Search
  $('#search').on('input', function () {
    const q = $(this).val().toLowerCase();
    getRows().each(function () {
      const txt = $(this).text().toLowerCase();
      $(this).toggle(txt.indexOf(q) > -1);
    });
  });

  // Sorting functions
  function sortByAbsAsc() {
    const $tbody = $('#attendance-table tbody');
    const rows = $tbody.find('tr').get();
    rows.sort(function (a, b) {
      const aAbs = parseInt($(a).find('td').eq(14).text()) || 0;
      const bAbs = parseInt($(b).find('td').eq(14).text()) || 0;
      return aAbs - bAbs;
    });
    $.each(rows, function (i, row) { $tbody.append(row); });
    $('#sortMessage').text('Sorted by absences (ascending)');
  }
  function sortByPartDesc() {
    const $tbody = $('#attendance-table tbody');
    const rows = $tbody.find('tr').get();
    rows.sort(function (a, b) {
      const aP = parseInt($(a).find('td').eq(15).text()) || 0;
      const bP = parseInt($(b).find('td').eq(15).text()) || 0;
      return bP - aP;
    });
    $.each(rows, function (i, row) { $tbody.append(row); });
    $('#sortMessage').text('Sorted by participation (descending)');
  }

  $('#sortAbs').on('click', function () { updateAll(); sortByAbsAsc(); });
  $('#sortPar').on('click', function () { updateAll(); sortByPartDesc(); });

  // Highlight excellent
  $('#highlightGood').on('click', function () {
    updateAll();
    getRows().each(function () {
      const abs = parseInt($(this).find('td').eq(14).text()) || 0;
      if (abs < 3) {
        const $r = $(this);
        $r.stop(true).animate({ opacity: 0.4 }, 140).addClass('green-row').animate({ opacity: 1 }, 160);
      }
    });
  });

  // Reset
  $('#reset').on('click', function () { location.reload(); });

  // Report / Pie chart
  let pieChart = null;
  function generateReport() {
    updateAll();
    const rows = getRows();
    let totalStudents = rows.length;
    let totalPresent = 0, totalPar = 0, totalAbs = 0;

    rows.each(function () {
      const tds = $(this).find('td');
      for (let i = 2; i <= 12; i += 2) {
        if (isPresentCell(tds.eq(i).text())) totalPresent++;
        else totalAbs++;
      }
      for (let i = 3; i <= 13; i += 2) {
        if (isParticipationCell(tds.eq(i).text())) totalPar++;
      }
    });

    $('#totalStudents').text(totalStudents);
    $('#totalPresent').text(totalPresent);
    $('#totalParticipation').text(totalPar);

    const ctx = document.getElementById('pieChart').getContext('2d');
    if (pieChart) pieChart.destroy();

    pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Absences', 'Presence', 'Participation'],
        datasets: [{
          data: [totalAbs, totalPresent, totalPar],
          backgroundColor: ['#ff6b6b', '#4caf50', '#1e88e5']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    // Scroll to chart nicely
    document.getElementById('report').scrollIntoView({ behavior: 'smooth' });
  }

  $('#showReport').on('click', generateReport);

  // Add student form: validation + append row
  $('#studentForm').on('submit', function (e) {
    e.preventDefault();
    // clear errors
    $('.error').text('');

    const sid = $('#sid').val().trim();
    const lname = $('#lname').val().trim();
    const fname = $('#fname').val().trim();
    const email = $('#email').val().trim();
    let ok = true;

    if (!/^[0-9]+$/.test(sid)) { $('#err-sid').text('Student ID must contain numbers only'); ok = false; }
    if (!/^[A-Za-z]+$/.test(lname)) { $('#err-lname').text('Last name must contain letters only'); ok = false; }
    if (!/^[A-Za-z]+$/.test(fname)) { $('#err-fname').text('First name must contain letters only'); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $('#err-email').text('Invalid email format'); ok = false; }

    if (!ok) return;

    // create new row with contenteditable S/P cells and placeholders
    const $row = $('<tr></tr>');
    $row.append($('<td></td>').text(lname));
    $row.append($('<td></td>').text(fname));
    for (let i = 0; i < 6; i++) {
      $row.append($('<td contenteditable="true">—</td>'));
      $row.append($('<td contenteditable="true">—</td>'));
    }
    $row.append($('<td></td>').text('0')); // abs
    $row.append($('<td></td>').text('0')); // part
    $row.append($('<td class="message"></td>').text('New student'));

    $('#attendance-table tbody').append($row);
    bindRow($row);
    updateRow($row);

    // success feedback
    alert('Student added successfully');
    this.reset();
  });

  // initial bindings & calculate
  bindAllRows();
  updateAll();
});
