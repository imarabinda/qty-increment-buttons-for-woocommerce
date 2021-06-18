jQuery(function ($) {
  var processes = [];
  // Make the code work after page load.
  $(document).ready(function () {
    QtyChng();
  });

  // Make the code work after executing AJAX.
  $(document).ajaxComplete(function () {
    QtyChng();
  });

  function QtyChng() {
    $(document)
      .off('click', '.qib-button')
      .on('click', '.qib-button', function () {
        // Find quantity input field corresponding to increment button clicked.
        var qty = $(this).siblings('.quantity').find('.qty');
        // Read value and attributes min, max, step.
        var val = parseFloat(qty.val());
        var max = parseFloat(qty.attr('max'));
        var min = parseFloat(qty.attr('min'));
        var step = parseFloat(qty.attr('step'));

        var oneParent = $(this).parent();
        var product_id = $(oneParent).prev().attr('data-product_id');
        // Change input field value if result is in min and max range.
        // If the result is above max then change to max and alert user about exceeding max stock.
        // If the field is empty, fill with min for "-" (0 possible) and step for "+".

        if (processes[product_id] == true) {
          processes[product_id] = false;
          if ($(this).is('.plus')) {
            if (val === max) {
              processes[product_id] = true;
              return false;
            }
            if (isNaN(val)) {
              qty.val(step);
            } else if (val + step > max) {
              qty.val(max);
              processes[product_id] = true;
            } else {
              qty.val(val + step);
              ajaxSendData(product_id, val + step, 'plus', this);
            }
          } else if ($(this).is('.minus')) {
            if (val === min) {
              ajaxSendData(product_id, 0, 'minus', this);
              return false;
            }
            if (isNaN(val)) {
              processes[product_id] = true;
              qty.val(min);
            } else if (val - step < min) {
              qty.val(min);

              processes[product_id] = true;
            } else {
              qty.val(val - step);
              ajaxSendData(product_id, val - step, 'minus', this);
            }
          }
        }
        qty.val(Math.round(qty.val() * 100) / 100);
        qty.trigger('change');
        $('body').removeClass('sf-input-focused');
      });
  }

  jQuery(document).on('click', '.quantity input', function () {
    $(this).keydown(function (event) {
      return false;
    });
    return false;
  });

  jQuery(document).on('click', '.increment_quantity_add_to_cart_button', function (e) {
    e.preventDefault();
    var product_id = $(this).attr('data-product_id');
    if (!processes.hasOwnProperty(product_id) || processes[product_id] == true) {
      $(this).addClass('loading');
      ajaxSendData(
        product_id,
        '1',
        'plus',
        this,
        true
      );
    }
  });

  function ajaxSendData(id, quantity, type, element, add_to_cart = false) {
    showInnerLoading(element);
    $.post(ArabindaCool.ajaxurl, {
      action: 'arabinda_add_to_cart',
      id: id,
      quantity: quantity,
      type: type,
    }).done(function (response) {
      if (response) {
        if (quantity == 0) {
          hideCounterAndShowAddToCart(element);
        } else if (add_to_cart) {
          hideAddToCartAndShowCounter(false, element);
        }
        addInputValue(element, response, add_to_cart);
      } else {
        if (add_to_cart) {
          hideAddToCartAndShowCounter(true, element);
        }
        if (quantity > 1) {
          var plusOrMinus = type == 'minus' ? quantity + 1 : quantity - 1;
          addInputValue(element, plusOrMinus);
        }
        alert('Oops handle broken, let me fix it in a while :)');
      }
      hideInnerLoading(element);
      processes[id] = true;
    });
  }

  function addInputValue(element, val, add_to_cart) {
    if (add_to_cart) {
      var b = $(element).next();
      element = $(b).find('.plus');
    }
    var qty = $(element).siblings('.quantity').find('.qty');
    qty.val(val);
  }

  // jQuery(document).on( "change input", ".quantity .qty", function() {

  // 	var add_to_cart_button = jQuery( this ).closest( ".product" ).find( ".add_to_cart_button" );

  // 	// For AJAX add-to-cart actions
  // 	add_to_cart_button.attr( "data-quantity", jQuery( this ).val() );

  // 	// For non-AJAX add-to-cart actions
  // 	add_to_cart_button.attr( "href", "?add-to-cart=" + add_to_cart_button.attr( "data-product_id" ) + "&quantity=" + jQuery( this ).val() );
  // });
  
  function hideAddToCartAndShowCounter(value, element) {
    var t = element;
    if (!value) {
      $(t).removeClass('loading');
      $(t).hide();
      var counter = jQuery(t).closest('qib-container');
      $(counter).show();
    } else {
      $(t).removeClass('loading');
    }
  }

  function hideCounterAndShowAddToCart(element) {
    var b = element;
    var oneParent = $(b).parent();
    $(oneParent).hide();
    var button = jQuery(oneParent).prev();
    $(button).show();
  }

  function showInnerLoading(element) {
    var t = $(element).siblings('.quantity');
    $(t).addClass('button loading disabled');
  }

  function hideInnerLoading(element) {
    var t = $(element).siblings('.quantity ');
    $(t).removeClass('button loading disabled');
  }

});
