var mangoCall = {
    phone: '',
    customer: {},
    orders: [],
    inDisplay: false,
    getCallState: function () {
        $.get('/mango/call.php?get_state=1', function (phone) {
            mangoCall.phone = phone;
        });
    },
    containerTemplate: `
    <div id="mangoContainer">
        <button type="button" onclick="mangoCall.showNewOrderForm();">Создать Заказ</button>
        <div>
        <div class="call-info">Разговор с <a href="tel:phone" class="c-info">phone</a></div>
        <div class="customer-info">Клиент: customer_name</div>
        <div class="last-order">Найденые заказы: order_count </div>
        </div>
        <span class="mangoClose">×</span>
    </div>`,
    showCallInfo: function () {
        let template = this.containerTemplate.replaceAll('phone', this.phone);
        if (this.customer.name) {
            template = template.replace('customer_name', this.customer.name + ', ' + this.customer.city);
        } else if (this.orders.length) {
            template = template.replace('customer_name', this.orders[0].customer_name + ', ' + this.orders[0].customer_city);
        } else {
            template = template.replace('customer_name', '<span class="c-info">Новый</span>');
        }
        if (this.orders.length) {
            var ordersList = '';
            this.orders.forEach(function (v) {
                var cDate = new Date(v.created_datetime);
                ordersList += `<span class="c-action" onclick="mangoCall.showEditOrderForm(${v.id})">${v.id}</span> <small>от ${cDate.toDateString()}</small>`;
            });
            template = template.replace('order_count', ordersList);
        } else {
            template = template.replace('order_count', '0');
        }

        $('body').append(template);
        this.inDisplay = true;
        $('#mangoContainer .mangoClose').on('click', function () {
            $('#mangoContainer').remove();
        });
    },
    removeCallInfo: function () {
        $('#mangoContainer').remove();
        this.inDisplay = false;
        this.customer = {};
        this.orders = [];
    },
    getInfo: function () {
        return new Promise(function (resolve, reject) {
            $.getJSON('/mango/call.php?get_info=' + mangoCall.phone, function (data) {
                mangoCall.customer = data.customer;
                mangoCall.orders = data.orders;
                resolve(data);
            });
        });
    },
    showNewOrderForm: function showNewOrderForm() {
        $('#ModalFormLoading').hide();
        $('#OrderEditorForm').show();
        set_modal_alert('');
        $('#OrderEditorModal_Label').html('Новый заказ');
        var empty_oef_data = get_empty_oef_data();

        empty_oef_data.customer_phone = this.phone;
        if (this.customer) {
            empty_oef_data.customer_name = this.customer.name;
            empty_oef_data.customer_city = this.customer.city;
            empty_oef_data.customer_addr = this.customer.description;
        } else if (this.orders.length) {
            empty_oef_data.customer_name = this.orders[0].customer_name;
            empty_oef_data.customer_city = this.orders[0].customer_city;
            empty_oef_data.customer_addr = this.orders[0].customer_addr;
        }


        set_oef_data(empty_oef_data);
        oef_set_disablefields_for_manager_js(empty_oef_data);
        oef_fields_set_disabled({"order_status": "1"});
        $('#oef_product_total_row').addClass('hidden');
        $('#OrderEditorModal')
            .modal('show')
            .find('.modal-body').css('max-height', get_modal_body_maxheight());
    },

    showEditOrderForm: function (orderId) {
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
            'what': "ajax",
            'task': "order-get-data",
            'order_id': orderId
        }

        $.ajax({
            url: './',
            type: 'GET',
            data: ajax_data,
            dataType: 'json',
            success: function (server_answer) {
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
            error: function (jqXHR, textStatus) {
                $('#OrderEditorModal .modal-header button.close').click();
                add_alert(PAGE_CONF.words.msg_order_connect_error, 'error');
            },
            complete: function (jqXHR, textStatus) {
                $('#ModalFormLoading').hide();
                $('#OrderEditorForm').show();
            }
        });
    },

    init: function () {
        setInterval(mangoCall.getCallState, 3000);
        setInterval(function () {
            if (mangoCall.phone && !mangoCall.inDisplay) {
                mangoCall.getInfo().then(function (r) {
                    mangoCall.showCallInfo();
                });
            }
            if (!mangoCall.phone && mangoCall.inDisplay) {
                mangoCall.removeCallInfo();
            }
        }, 1000)
    }
}

mangoCall.init();





