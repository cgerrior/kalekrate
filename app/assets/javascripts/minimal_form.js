$(document).ready(function() {

  // On form submit, we stop submission to go get the token
  $('form').on('submit', function (event) {
    event.preventDefault();

    // Disable the submit button
    $('#subscribe').prop('disabled', true);
    clear_errors();

    var form = this;

    // for payments with a review step, the token will already be present
    if ($('#recurly-token').val()) {
      create_subscription();
    }
    else {
      getToken(form, create_subscription);
    }
  });

  $('#continue').on('click', function() {
    var form = $("form")[0];

    clear_errors();

    getToken(form, review);
  });

  function getToken (form, next) {
    var paymentType = $('#payment_type').val() || 'card';
    var paymentTokens = {
      card: recurly,
      'bank-account': recurly.bankAccount
    };

    if (paymentType === 'paypal') {

      recurly.paypal({ description: 'test' }, function (err, token) {
        if (err) {
          console.log(err);
          // Let's handle any errors using the function below
          paypalError(err);
        } else {
          // set the hidden field above to the token we get back from Recurly
          $('#recurly-token').val(token.id);

          // Now we submit the form!
          form.submit();
        }
      });
    }

    else {

      // Now we call appropriate recurly.token function with the form. It goes to Recurly servers
      // to tokenize the credit card information, then injects the token into the
      // data-recurly="token" field above

      paymentTokens[paymentType].token(form, function (err, token) {
        if (err) {
          error(err);
        } else {
          $('#recurly-token').val(token.id);
          next();
        }
      });
    }
  }



  // Identity card type
  $("#number").on('change', function(event) {
    var card_number = $("#number").val()
      , card_type = recurly.validate.cardType(card_number)
      , card_is_valid = recurly.validate.cardNumber($("#number").val())
      , number_field = $('.customer-fields--card-number .form-input');

    if(card_is_valid) {
      $(number_field).removeClass('form-input__error');
    }
    else {
      $(number_field).addClass('form-input__error');
    }

    if((card_type == 'default') || (card_type == 'unknown')) {
      $('.icon-card').addClass('icon-card__generic');
      $('.icon-card').removeClass('icon-card__visa icon-card__mastercard icon-card__amex icon-card__visa discover');
    }
    else {
      $('.icon-card').removeClass('icon-card__generic');
      $('.icon-card').addClass('icon-card__' + card_type);
    }
  });
});
