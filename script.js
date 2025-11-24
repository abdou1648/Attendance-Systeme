$(document).ready(function() {
  
    $('#attendance-table tbody tr').each(function() {
      let abs = parseInt($(this).find('td').eq(8).text());
      let msg = '';
      if (abs < 3) {
        $(this).css('background', '#c8f7c5');
        msg = 'Good attendance';
      } else if (abs <= 4) {
        $(this).css('background', '#fff8c5');
        msg = 'Warning: low attendance';
      } else {
        $(this).css('background', '#ffbaba');
        msg = 'Excluded – too many absences';
      }
      $(this).find('td').eq(10).text(msg);
    });
  
    
    $('#search').on('keyup', function() {
      let val = $(this).val().toLowerCase();
      $('#attendance-table tbody tr').filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(val) > -1);
      });
    });
  
    
    $('#sort-abs').click(function() {
      let rows = $('#attendance-table tbody tr').get();
      rows.sort((a, b) =>
        parseInt($(a).find('td').eq(8).text()) - parseInt($(b).find('td').eq(8).text())
      );
      $('#attendance-table tbody').append(rows);
    });
  
    $('#sort-par').click(function() {
      let rows = $('#attendance-table tbody tr').get();
      rows.sort((a, b) =>
        parseInt($(b).find('td').eq(9).text()) - parseInt($(a).find('td').eq(9).text())
      );
      $('#attendance-table tbody').append(rows);
    });
  
    
    $('#highlight-excellent').click(function() {
      $('#attendance-table tbody tr').each(function() {
        let abs = parseInt($(this).find('td').eq(8).text());
        if (abs < 3) {
          $(this).fadeOut(200).fadeIn(200);
        }
      });
    });
  
    $('#reset').click(function() {
      location.reload();
    });
  
    
    $('#student-form').submit(function(e) {
      e.preventDefault();
      let id = $('#id').val().trim();
      let lname = $('#lname').val().trim();
      let fname = $('#fname').val().trim();
      let email = $('#email').val().trim();
      let valid = true;
      $('.error').text('');
  
      if (!/^[0-9]+$/.test(id)) { $('#err-id').text('ID must be numbers'); valid = false; }
      if (!/^[A-Za-z]+$/.test(lname)) { $('#err-lname').text('Letters only'); valid = false; }
      if (!/^[A-Za-z]+$/.test(fname)) { $('#err-fname').text('Letters only'); valid = false; }
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) { $('#err-email').text('Invalid email'); valid = false; }
  
      if (valid) {
        $('#attendance-table tbody').append(`
          <tr><td>${lname}</td><td>${fname}</td>
          <td></td><td></td><td></td><td></td><td></td><td></td>
          <td>0</td><td>0</td><td>New student</td></tr>
        `);
        alert('Student added successfully!');
        this.reset();
      }
    });
  });