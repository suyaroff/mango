function showNewOrderForm(data = {}) {
    $('#ModalFormLoading').hide();
    $('#OrderEditorForm').show();
    set_modal_alert('');
    $('#OrderEditorModal_Label').html('Новый заказ');
    var empty_oef_data = get_empty_oef_data();
    if (data.customer_phone) {
        empty_oef_data.customer_phone = data.customer_phone;
        empty_oef_data.customer_name = data.customer_name;
        empty_oef_data.customer_city = data.customer_city;
        empty_oef_data.customer_addr = data.customer_addr;
    }
    set_oef_data(empty_oef_data);
    oef_set_disablefields_for_manager_js(empty_oef_data);
    oef_fields_set_disabled({ "order_status": "1" });
    $('#oef_product_total_row').addClass('hidden');
    $('#OrderEditorModal')
        .modal('show')
        .find('.modal-body').css('max-height', get_modal_body_maxheight());
}

function showEditOrderForm(orderId) {
    var modal_label = $('#OrderEditorModal_Label');
    var modal_label_text = modal_label.attr('data-label-default').replace('%order_id%', orderId);
    modal_label.html(modal_label_text);
    $('#ModalFormLoading').show();
    $('#OrderEditorForm').hide();
    set_modal_alert('');
    $('#OrderEditorModal')
        .modal('show')
        .find('.modal-body').css('max-height', get_modal_body_maxheight());

    var ajax_data = {
        'what'	  	: "ajax",
        'task'	  	: "order-get-data",
        'order_id'	:  orderId
    }

    $.ajax({
        url : './',
        type: 'GET',
        data : ajax_data,
        dataType : 'json',
        success : function(server_answer) {
            if (server_answer.order_data) {
                var form_order_data = server_answer.order_data;
                form_order_data.products_ary = obj_to_ary(form_order_data.products_ary);
                set_oef_data(form_order_data);
                $("#oef_order_type1").val(form_order_data.order_type);
                return false;
                oef_set_disablefields_for_manager_js(form_order_data);
                if (form_order_data.products_not_in_store == "yes" || form_order_data.products_empty == "yes") {
                    oef_fields_set_disabled({"order_status": "1"});
                }
                update_oef_payment_discount();
            } else {
                $('#OrderEditorModal .modal-header button.close').click();
                add_alert(PAGE_CONF.words.msg_order_get_error, 'error');
            }
        },
        error : function(jqXHR, textStatus) {
            $('#OrderEditorModal .modal-header button.close').click();
            add_alert(PAGE_CONF.words.msg_order_connect_error, 'error');
        },
        complete : function(jqXHR, textStatus) {
            $('#ModalFormLoading').hide();
            $('#OrderEditorForm').show();
        }
    });
}

function orderSaveTrigger() {
    $('#OrderEditorModal_SaveButton').trigger('click');
}


function getWorker() {
    $.getJSON('/mango/worker.php', function (data) {
        if (data.phone) {
            var options = { customer_phone: data.phone, customer_name: '', customer_city: '', customer_addr: '', };
            if (data.order) {
                showEditOrderForm(data.order.id);
            } else if (data.customer) {
                options.customer_name = data.customer.name;
                options.customer_city = data.customer.city;
                options.customer_addr = data.customer.description;
                showNewOrderForm(options);
            } else {
                showNewOrderForm(options);
            }
        }
    });
}
//setInterval(getWorker, 3000);

