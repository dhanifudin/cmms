-- Adminer 5.3.1-dev PostgreSQL 16.6 dump

DROP TABLE IF EXISTS "m_approval";
CREATE TABLE "public"."m_approval" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_task" uuid,
    "name" character varying,
    "description" text,
    "stock" character varying,
    "id_uom" uuid,
    "price" numeric(65,30),
    "attachment" character varying,
    CONSTRAINT "m_approval_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_approval_location";
CREATE TABLE "public"."m_approval_location" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "status" character varying,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_user" uuid,
    "id_last_location" uuid,
    "id_new_location" uuid,
    CONSTRAINT "m_approval_location_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_asset";
CREATE TABLE "public"."m_asset" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_category" uuid NOT NULL,
    "id_location" uuid,
    "name" character varying NOT NULL,
    "brand" character varying,
    "type" character varying,
    "serial_number" character varying,
    "description" text,
    "latitude" character varying,
    "longitude" character varying,
    "acquired_date" timestamptz(6),
    "attachment" character varying,
    "asset_status" character varying,
    "dimesion_height" integer,
    "dimesion_weight" integer,
    "dimesion_width" integer,
    "id_dimesion_uom" uuid,
    "id_client" uuid NOT NULL,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "manufacture_year" timestamptz(6),
    "accumulated_depreciation_value" numeric,
    "asset_value" numeric,
    "book_value" numeric,
    "codeification" character varying,
    "color" character varying,
    "depreciation_method" character varying,
    "id_maintenance_group" uuid,
    "id_vendor" uuid,
    "kso" boolean,
    "period_start" integer,
    "remaining_depreciation_value" numeric,
    "usable_life" numeric,
    "depreciate" boolean DEFAULT false,
    "expense" double precision,
    "life" integer,
    "penerimaan_barang_number" character varying,
    CONSTRAINT "m_asset_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_assets";
CREATE TABLE "public"."m_assets" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_category" uuid,
    "id_location" uuid,
    "name" character varying,
    "brand" character varying,
    "type" character varying,
    "serial_number" character varying,
    "description" text,
    "latitude" character varying,
    "longitude" character varying,
    "acquired_date" timestamptz,
    "attachment" character varying,
    "asset_status" character varying,
    "dimension_height" bigint,
    "dimension_weight" bigint,
    "dimension_width" bigint,
    "id_dimension_uom" uuid,
    "id_client" uuid,
    "created_by" uuid,
    "updated_at" timestamptz,
    "updated_by" uuid,
    "deleted_at" timestamptz,
    "created_at" timestamptz DEFAULT now(),
    "manufacture_year" timestamptz,
    "accumulated_depreciation_value" numeric,
    "asset_value" numeric,
    "book_value" numeric,
    "codeification" character varying,
    "color" character varying,
    "depreciation_method" character varying,
    "id_maintenance_group" uuid,
    "id_vendor" uuid,
    "kso" boolean,
    "period_start" bigint,
    "remaining_depreciation_value" numeric,
    "usable_life" numeric,
    "depreciate" boolean DEFAULT false,
    "expense" numeric,
    "life" bigint,
    "penerimaan_barang_number" character varying,
    CONSTRAINT "m_assets_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_category";
CREATE TABLE "public"."m_category" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_parent" uuid,
    "name" character varying NOT NULL,
    "description" text,
    "summary_level" boolean,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    CONSTRAINT "m_category_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_client";
CREATE TABLE "public"."m_client" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying,
    "pic" character varying,
    "phone" character varying,
    "email" character varying,
    "address" character varying,
    "logo" character varying,
    "created_at" timestamptz(6),
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    CONSTRAINT "m_client_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_faq";
CREATE TABLE "public"."m_faq" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "question" text,
    "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
    "answer" text,
    "sequence" numeric,
    "id_client" uuid,
    "deleted_at" timestamp(6),
    "url" character varying,
    CONSTRAINT "m_faq_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_floor_map";
CREATE TABLE "public"."m_floor_map" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "svg" text NOT NULL,
    "id_client" uuid NOT NULL,
    "id_location" uuid,
    CONSTRAINT "m_floor_map_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_form";
CREATE TABLE "public"."m_form" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying,
    "type" character varying,
    "id_user" uuid,
    "created_at" timestamptz(6),
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "id_schedule_line" uuid,
    CONSTRAINT "m_form_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_inventory";
CREATE TABLE "public"."m_inventory" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid,
    "satuan" character varying,
    "jumlah" character varying,
    "notes" text,
    "kode_barang" character varying,
    CONSTRAINT "m_inventory_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_location";
CREATE TABLE "public"."m_location" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_parent" uuid,
    "name" character varying NOT NULL,
    "description" text,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    "id_site" uuid,
    "id_category" uuid,
    "patch_code" character varying,
    "disposal_location" boolean DEFAULT false,
    CONSTRAINT "m_location_primary_key_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_locations";
CREATE TABLE "public"."m_locations" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_parent" uuid,
    "name" character varying,
    "description" text,
    "created_at" timestamptz DEFAULT now(),
    "created_by" uuid,
    "updated_at" timestamptz,
    "updated_by" uuid,
    "id_client" uuid,
    "deleted_at" timestamptz,
    "id_site" uuid,
    "id_category" uuid,
    "patch_code" character varying,
    "disposal_location" boolean DEFAULT false,
    CONSTRAINT "m_locations_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_maintenance_group";
CREATE TABLE "public"."m_maintenance_group" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying,
    "code" character varying,
    "description" text,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "id_client" uuid NOT NULL,
    CONSTRAINT "m_maintenance_group_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_maintenance_group_role";
CREATE TABLE "public"."m_maintenance_group_role" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_maintenance_group" uuid,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "id_role" uuid,
    "level" numeric,
    CONSTRAINT "m_maintenance_role_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_maintenance_group_user";
CREATE TABLE "public"."m_maintenance_group_user" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_maintenance_group_role" uuid,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "id_user" uuid NOT NULL,
    CONSTRAINT "m_maintenance_user_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_maintenance_groups";
CREATE TABLE "public"."m_maintenance_groups" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying,
    "code" character varying,
    "description" text,
    "created_by" uuid,
    "updated_at" timestamptz,
    "updated_by" uuid,
    "deleted_at" timestamptz,
    "created_at" timestamptz DEFAULT now(),
    "id_client" uuid,
    CONSTRAINT "m_maintenance_groups_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_maintenance_schedule_header";
CREATE TABLE "public"."m_maintenance_schedule_header" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_category" uuid,
    "id_location" uuid,
    "id_maintenance_group" uuid,
    "id_spv_created" uuid,
    "id_spv_assign" uuid,
    "name" character varying,
    "notes" character varying,
    "attachment" character varying,
    "interval_number" integer,
    "interval_uom" uuid,
    "approval_status" character varying,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    "end_date" timestamptz(6),
    "start_date" timestamptz(6),
    "doc_no" character varying,
    "on_day" integer,
    "on_month" character varying,
    "repeat" character varying,
    "repeat_every" integer,
    "weeks" character varying,
    "id_asset" uuid,
    "id_standard_maintenance" uuid,
    CONSTRAINT "m_maintenance_schedule_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_maintenance_schedule_line";
CREATE TABLE "public"."m_maintenance_schedule_line" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_m_maintenance_schedule" uuid,
    "id_staff" uuid,
    "notes" text,
    "planned_date" timestamptz(6),
    "due_date" timestamptz(6),
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid,
    "deleted_at" timestamptz(6),
    "id_asset" uuid,
    "task_description" text,
    "id_category" uuid,
    "id_location" uuid,
    CONSTRAINT "m_maintenance_schedule_task_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_maintenance_staff";
CREATE TABLE "public"."m_maintenance_staff" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_maintenance_spv" uuid,
    "id_staff" uuid,
    "description" text,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "id_category" uuid,
    "id_site" uuid,
    CONSTRAINT "m_maintenance_staff_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_material";
CREATE TABLE "public"."m_material" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying,
    "description" text,
    "stock" numeric,
    "id_uom" uuid,
    "price" numeric,
    "attachment" character varying,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz(6),
    CONSTRAINT "m_material_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_menu";
CREATE TABLE "public"."m_menu" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying,
    "icon" character varying,
    "url" character varying,
    "id_parent" uuid,
    "sequence" integer,
    "created_by" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" uuid,
    "updated_at" timestamptz(6),
    "deleted_at" timestamptz(6),
    "mode" character varying,
    "table" character varying,
    "status" character varying,
    CONSTRAINT "m_menu_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_menu_client";
CREATE TABLE "public"."m_menu_client" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_menu" uuid,
    "id_client" uuid,
    CONSTRAINT "m_menu_client_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_notification";
CREATE TABLE "public"."m_notification" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying,
    "url" character varying,
    "created_at" timestamp(6),
    "created_by" uuid,
    "read_at" timestamp(6),
    "messages" text,
    "id_receiver" uuid,
    "deleted_at" timestamp(6),
    "id_complaint" uuid,
    "url_mobile" character varying,
    CONSTRAINT "m_notification_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_printer";
CREATE TABLE "public"."m_printer" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name_printer" character varying,
    "id_client" uuid,
    "id_server" uuid,
    "local_printer" character varying,
    "created_at" timestamptz(6),
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "last_active" timestamptz(6),
    CONSTRAINT "m_printer_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_role";
CREATE TABLE "public"."m_role" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying NOT NULL,
    "description" text,
    "icon" character varying,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    "type" character varying,
    "url_home" character varying,
    CONSTRAINT "m_role_primary_key_id" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE INDEX fki_m_role_foreign_key_created_by ON public.m_role USING btree (created_by);

CREATE INDEX fki_m_role_foreign_key_id_client ON public.m_role USING btree (id_client);

CREATE INDEX fki_m_role_foreign_key_updated_by ON public.m_role USING btree (updated_by);


DROP TABLE IF EXISTS "m_role_menu";
CREATE TABLE "public"."m_role_menu" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_menu" uuid,
    "id_role" uuid,
    "created_at" timestamptz(6),
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    CONSTRAINT "m_role_menu_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_running_number";
CREATE TABLE "public"."m_running_number" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "table" text NOT NULL,
    "prefix" text NOT NULL,
    "last" text NOT NULL,
    "id_client" uuid,
    CONSTRAINT "m_running_number_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_server";
CREATE TABLE "public"."m_server" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "server_name" character varying,
    "id_client" uuid,
    "server_api" character varying,
    "created_at" timestamptz(6),
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    CONSTRAINT "m_server_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_standart_maintenance_task";
CREATE TABLE "public"."m_standart_maintenance_task" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying,
    "id_category" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    CONSTRAINT "m_standart_maintenance_task_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_standart_register_task";
CREATE TABLE "public"."m_standart_register_task" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_task_register" uuid,
    "id_standart_maintenance_task" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "id_client" uuid,
    "updated_at" timestamptz(6),
    "created_by" uuid,
    CONSTRAINT "m_standart_register_task_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_task";
CREATE TABLE "public"."m_task" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_category" uuid,
    "name" character varying,
    "type" character varying DEFAULT 'choice',
    "id_client" uuid,
    "created_by" uuid,
    "created_at" timestamptz(6),
    "updated_at" timestamptz(6),
    "deleted_at" timestamptz(6),
    "updated_by" uuid,
    "id_inventory" uuid,
    "option" json,
    CONSTRAINT "m_task_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_task_inventory";
CREATE TABLE "public"."m_task_inventory" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_task" uuid,
    "id_inventory" uuid,
    "qty" character varying,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    CONSTRAINT "m_task_inventory_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "m_uom";
CREATE TABLE "public"."m_uom" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying NOT NULL,
    "uom_code" character varying,
    "note" text,
    "uom_type" character varying,
    "id_client" uuid NOT NULL,
    "created_by" uuid,
    "updated_by" uuid,
    "updated_at" timestamptz(6),
    "deleted_at" timestamptz(6),
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "value" integer,
    CONSTRAINT "m_uom_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE INDEX fki_m_uom_foreign_key_created_by ON public.m_uom USING btree (created_by);

CREATE INDEX fki_m_uom_foreign_key_id_client ON public.m_uom USING btree (id_client);

CREATE INDEX fki_m_uom_foreign_key_updated_by ON public.m_uom USING btree (updated_by);


DROP TABLE IF EXISTS "m_user";
CREATE TABLE "public"."m_user" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying NOT NULL,
    "username" character varying NOT NULL,
    "password" character varying NOT NULL,
    "gender" character varying,
    "addres" character varying,
    "no_telp" character varying,
    "email" character varying,
    "photo" character varying,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    "id_maintenance_group_user" uuid,
    "id_location" uuid,
    CONSTRAINT "m_user_primary_key_id" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX m_user_username_key ON public.m_user USING btree (username);


DROP TABLE IF EXISTS "m_users";
CREATE TABLE "public"."m_users" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying,
    "username" character varying,
    "password" character varying,
    "gender" character varying,
    "address" character varying,
    "no_telp" character varying,
    "email" character varying,
    "photo" character varying,
    "created_at" timestamptz DEFAULT now(),
    "created_by" uuid,
    "updated_at" timestamptz,
    "updated_by" uuid,
    "id_client" uuid,
    "deleted_at" timestamptz,
    "id_maintenance_group" uuid,
    "id_location" uuid,
    CONSTRAINT "m_users_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX uni_m_users_username ON public.m_users USING btree (username);


DROP TABLE IF EXISTS "m_vendor";
CREATE TABLE "public"."m_vendor" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying,
    "pic" character varying,
    "no_telp" character varying,
    "email" character varying,
    "address" character varying,
    "description" text,
    "logo" character varying,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz(6),
    CONSTRAINT "m_vendor_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_approval";
CREATE TABLE "public"."t_approval" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_wo" uuid,
    "id_maintenance_schedule" uuid,
    "id_user_approval" uuid,
    "status" character varying,
    "approval_type" text,
    "approval_date" timestamptz(6),
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz(6),
    CONSTRAINT "t_approval_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_audit_log";
CREATE TABLE "public"."t_audit_log" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_table" uuid NOT NULL,
    "table_name" character varying,
    "column_name" character varying,
    "transaction_date" timestamptz(6),
    "id_user" uuid,
    "created_by" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "current_value" json,
    "id_client" uuid,
    "transaction_status" character varying,
    CONSTRAINT "t_audit_log_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_complaint";
CREATE TABLE "public"."t_complaint" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_maintenance_group" uuid,
    "complaint_mesasage" character varying,
    "complaint_date" timestamptz(6),
    "id_asset" uuid,
    "complaint_attachment" character varying,
    "notes" text,
    "status" character varying,
    "complaint_priority" character varying,
    "fixed_by" uuid,
    "created_by" uuid,
    "updated_at" timestamp(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamp(6),
    "complaint_no" character varying,
    "id_location" uuid,
    "attachment_complete" character varying,
    "complete_description" text,
    "checked_by" uuid,
    "checking_date" timestamp(6),
    "fixed_at" timestamp(6),
    "id_sparepart" uuid,
    CONSTRAINT "t_complaint_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_complaints";
CREATE TABLE "public"."t_complaints" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_maintenance_group" uuid,
    "complaint_message" character varying,
    "complaint_date" timestamptz,
    "id_asset" uuid,
    "complaint_attachment" character varying,
    "notes" text,
    "status" character varying,
    "complaint_priority" character varying,
    "fixed_by" uuid,
    "created_by" uuid,
    "updated_at" timestamp,
    "updated_by" uuid,
    "id_client" uuid,
    "created_at" timestamp DEFAULT now(),
    "deleted_at" timestamp,
    "complaint_no" character varying,
    "id_location" uuid,
    "attachment_complete" character varying,
    "complete_description" text,
    "checked_by" uuid,
    "checking_date" timestamp,
    "fixed_at" timestamp,
    "id_sparepart" uuid,
    CONSTRAINT "t_complaints_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_depreciation";
CREATE TABLE "public"."t_depreciation" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "document_number" character varying,
    "status" character varying,
    "date_depreciation" timestamptz(6) NOT NULL,
    "id_user" uuid,
    "id_category" uuid,
    "id_maintenance_group" uuid,
    "period" timestamptz(6),
    CONSTRAINT "t_depreciation_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_depreciation_detail";
CREATE TABLE "public"."t_depreciation_detail" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_depreciation" uuid,
    "id_departement" uuid,
    "id_asset" uuid,
    "expense_value" numeric,
    "asset_period" integer,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    CONSTRAINT "t_depreciation_detail_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_depreciation_expense";
CREATE TABLE "public"."t_depreciation_expense" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_asset" uuid,
    "expense" double precision,
    "asset_period" integer,
    "asset_cost" double precision,
    "remaining_amount" double precision,
    "date_depre" timestamptz(6),
    "period" timestamptz(6),
    "created_at" timestamptz(6),
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    CONSTRAINT "t_depreciation_expense_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_disposal";
CREATE TABLE "public"."t_disposal" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_user" uuid,
    "id_departement" uuid,
    "id_asset" uuid,
    "document_no" text,
    "date_disposal" timestamptz(6),
    "description" text,
    "asset_cost" numeric,
    "accumulated_depreciation" numeric,
    "disposal_amout" numeric,
    "status" character varying,
    "id_approval" uuid,
    "total_value" numeric,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz(6),
    CONSTRAINT "t_disposal_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_disposal_details";
CREATE TABLE "public"."t_disposal_details" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_asset" uuid,
    "id_disposal" uuid,
    "quantity" numeric,
    "value_accumulated_depreciation" numeric,
    "notes" text,
    "description" text,
    "date_disposal" timestamptz(6),
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz(6),
    "asset_value" double precision,
    "attachment" character varying,
    CONSTRAINT "t_disposal_details_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_history_task";
CREATE TABLE "public"."t_history_task" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "desc" text,
    "attachment" character varying,
    "take_over" timestamp(6),
    "handover" timestamp(6),
    "fixed_by" uuid,
    "fixed_date" timestamp(6),
    "hand_over_by" uuid,
    "take_over_by" uuid,
    "id_task" uuid,
    "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "t_history_task_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_inspection_order";
CREATE TABLE "public"."t_inspection_order" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "inspection_no" character varying,
    "id_maintenance_group" uuid,
    "id_location" uuid,
    "id_category" uuid,
    "id_asset" uuid,
    "status" character varying,
    "evaluation" character varying,
    "evaluation_reason" character varying,
    "created_by" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "id_inspector" uuid,
    "inspected_at" timestamptz(6),
    "inspection_reference" uuid,
    "id_maintenance_order" uuid,
    CONSTRAINT "t_inspection_order_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_inspection_task";
CREATE TABLE "public"."t_inspection_task" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "type" character varying,
    "option" json,
    "form_response" character varying,
    "attachment" character varying,
    "id_inspection_order" uuid,
    "created_by" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "name_task" character varying,
    CONSTRAINT "t_inspection_task_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_maintenance_order";
CREATE TABLE "public"."t_maintenance_order" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "schedule_number" character varying,
    "schedule_date" timestamptz(6),
    "name" character varying,
    "id_asset" uuid,
    "id_standard_maintenance_task" uuid,
    "status" character varying,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "evaluation" character varying,
    "evaluation_reason" character varying,
    "id_parent" uuid,
    "order_number" character varying,
    "evaluation_attachment" character varying,
    CONSTRAINT "t_maintenance_order_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_maintenance_schedule_task";
CREATE TABLE "public"."t_maintenance_schedule_task" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_maintenance_schedule_task" uuid,
    "id_staff" uuid,
    "task_description" text,
    "quantity" numeric,
    "notes" text,
    "id_uom" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    "due_date" timestamptz(6),
    "planned_date" timestamptz(6),
    "status" character varying,
    "budget_cost" integer,
    "actual_cost" integer,
    CONSTRAINT "m_maintenance_schedule_cost_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_maintenance_task";
CREATE TABLE "public"."t_maintenance_task" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_cascade_wo" uuid,
    "id_wo" uuid,
    "task_description" text,
    "id_staff" uuid,
    "notes" text,
    "planned_date" timestamptz(6),
    "due_date" timestamptz(6),
    "status" character varying,
    "budget_cost" numeric,
    "actual_cost" numeric,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz(6),
    "actual_end_date" timestamptz(6),
    "attachment" character varying,
    CONSTRAINT "t_maintenance_task_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_maintenance_task_line";
CREATE TABLE "public"."t_maintenance_task_line" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_maintenance_task" uuid,
    "type" character varying,
    "id_material" uuid,
    "description" text,
    "quantity" numeric,
    "price" numeric,
    "notes" text,
    "id_uom" uuid,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz(6),
    CONSTRAINT "t_maintenance_cost_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_material_request";
CREATE TABLE "public"."t_material_request" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "requested_by" uuid,
    "status" character varying,
    "id_maintenance_group" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "name" character varying,
    "id_maintenance_order" uuid,
    "id_repair_order" uuid,
    CONSTRAINT "t_material_request_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_material_request_detail";
CREATE TABLE "public"."t_material_request_detail" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_material_request" uuid,
    "id_inventory" uuid,
    "qty" character varying,
    "status" character varying,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    CONSTRAINT "t_material_request_detail_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_material_return";
CREATE TABLE "public"."t_material_return" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "status" character varying,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "name" character varying,
    "id_maintenance_order" uuid,
    "id_repair_order" uuid,
    "returned_by" uuid,
    CONSTRAINT "t_material_return_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_material_return_detail";
CREATE TABLE "public"."t_material_return_detail" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_inventory" uuid,
    "qty" character varying,
    "status" character varying,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_material_return" uuid,
    "id_material_request_detail" uuid,
    CONSTRAINT "t_material_return_detail_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_material_wo";
CREATE TABLE "public"."t_material_wo" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_wo" uuid,
    "id_material" uuid,
    "id_client" uuid,
    "stock" numeric,
    CONSTRAINT "t_material_wo_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_movement";
CREATE TABLE "public"."t_movement" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "document_no" text NOT NULL,
    "movement_date" timestamptz(6),
    "description" text,
    "id_departement" uuid,
    "id_staff" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid NOT NULL,
    "id_locatorto" uuid,
    "status" character varying,
    CONSTRAINT "t_movement_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_movement_line";
CREATE TABLE "public"."t_movement_line" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_locatorfrom" uuid,
    "description" text,
    "id_asset" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid NOT NULL,
    "id_movement" uuid,
    "id_locatorto" uuid,
    CONSTRAINT "t_movement_line_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_opname";
CREATE TABLE "public"."t_opname" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_opname_schedule" uuid,
    "document_no" text,
    "date_opname" timestamptz(6),
    "description" text,
    "location_warehouse" uuid,
    "status" character varying,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamp(6),
    "id_client" uuid NOT NULL,
    "id_category" uuid,
    CONSTRAINT "t_opname_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_opname_line";
CREATE TABLE "public"."t_opname_line" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_asset" uuid,
    "id_opname" uuid,
    "quantity" numeric,
    "quantity_actual" numeric,
    "notes" text,
    "opname_description" text,
    "date_opname" timestamptz(6),
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "status" character varying NOT NULL,
    "id_movement" uuid,
    "attachment" character varying,
    CONSTRAINT "t_opname_schedule_detail_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_opname_schedule";
CREATE TABLE "public"."t_opname_schedule" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "date_opname" timestamptz(6),
    "opname_description" text,
    "status" character varying,
    "total_item" integer,
    "id_user" uuid,
    "id_approval" uuid,
    "id_location" uuid NOT NULL,
    "document_no" character varying,
    "id_category" uuid,
    CONSTRAINT "t_opname_schedule_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_order_inventory";
CREATE TABLE "public"."t_order_inventory" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_task" uuid,
    "id_inventory" uuid,
    "qty" character varying,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    CONSTRAINT "t_order_inventory_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_order_task";
CREATE TABLE "public"."t_order_task" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "description" character varying,
    "notes" character varying,
    "date" timestamptz(6),
    "actual_date" timestamptz(6),
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "id_staff" uuid,
    "status" character varying,
    "id_client" uuid,
    "attachment" character varying,
    "value" character varying,
    "type" character varying,
    "name" character varying,
    "id_t_maintenance_order" uuid,
    "option" json,
    CONSTRAINT "t_order_task_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_preventive_history_line";
CREATE TABLE "public"."t_preventive_history_line" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "desc" character varying,
    "take_over" timestamptz(6),
    "handover" timestamptz(6),
    "fixed_by" uuid,
    "fixed_date" timestamptz(6),
    "hand_over_by" uuid,
    "take_over_by" uuid,
    "id_preventive_line" uuid,
    "created_at" timestamptz(6),
    "id_client" uuid,
    "attachment" character varying,
    "deleted_at" timestamptz(6),
    CONSTRAINT "t_preventive_history_line_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_preventive_work_order_header";
CREATE TABLE "public"."t_preventive_work_order_header" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "order_no" character varying,
    "id_asset" uuid,
    "preventive_date" timestamptz(6),
    "assign_user" uuid,
    "description" character varying,
    "status" character varying,
    "actual_date" timestamptz(6),
    "id_category" uuid,
    "id_location" uuid,
    "id_client" uuid,
    "created_at" timestamptz(6),
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "id_maintenance_group" uuid,
    "id_schedule_header_line" uuid,
    "pwo" character varying,
    "id_maintenance_header" uuid,
    CONSTRAINT "t_preventive_work_order_header_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_preventive_work_order_line";
CREATE TABLE "public"."t_preventive_work_order_line" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_preventive_work_order_header" uuid NOT NULL,
    "description" character varying,
    "notes" character varying,
    "date" timestamptz(6),
    "actual_date" timestamptz(6),
    "created_at" timestamptz(6),
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "id_user" uuid,
    "status" character varying DEFAULT 'Not Started',
    "id_client" uuid,
    "attachment" character varying,
    "value" character varying,
    "type" character varying,
    "name" character varying,
    CONSTRAINT "t_preventive_work_order_line_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_printer_job";
CREATE TABLE "public"."t_printer_job" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_printer" uuid,
    "id_asset" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "deleted_at" timestamptz(6),
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "status" character varying,
    "local_printer" character varying,
    "id_location" uuid,
    "type" character varying,
    CONSTRAINT "t_printer_job_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_repair_material";
CREATE TABLE "public"."t_repair_material" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_repair_task" uuid,
    "id_inventory" uuid,
    "qty" character varying,
    "created_by" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    CONSTRAINT "t_repair_material_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_repair_order";
CREATE TABLE "public"."t_repair_order" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "repair_no" character varying,
    "id_inspection_order" uuid,
    "request_date" timestamptz(6) NOT NULL,
    "requested_by" uuid,
    "id_maintenance_group" uuid,
    "id_location" uuid,
    "id_category" uuid,
    "id_asset" uuid,
    "id_vendor" uuid,
    "priority" character varying,
    "status" character varying,
    "created_by" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "id_maintenance_order" uuid,
    "evaluation" character varying,
    "evaluation_reason" character varying,
    CONSTRAINT "t_repair_order_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_repair_task";
CREATE TABLE "public"."t_repair_task" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "type" character varying,
    "option" json,
    "form" character varying,
    "id_user" uuid,
    "created_by" uuid,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "deleted_at" timestamptz(6),
    "id_client" uuid,
    "id_repair_order" uuid,
    "name_task" character varying,
    "status" character varying,
    "attachment" character varying,
    "id_task" uuid,
    CONSTRAINT "t_repair_task_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_work_order";
CREATE TABLE "public"."t_work_order" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "id_asset" uuid,
    "id_maintenance_group" uuid,
    "id_vendor" uuid,
    "id_complaint_user" uuid,
    "complaint_message" text,
    "complaint_attachment" character varying,
    "complaint_date_request" timestamptz(6),
    "id_maintenance_schedule" uuid,
    "id_wo_preventive" uuid,
    "id_maintenance_leader" uuid,
    "id_spv" uuid,
    "wo_no" character varying,
    "name" character varying,
    "date" timestamptz(6),
    "notes" text,
    "attachment" character varying,
    "planned_date" timestamptz(6),
    "due_date" timestamptz(6),
    "actual_date" timestamptz(6),
    "status" character varying NOT NULL,
    "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" uuid,
    "updated_at" timestamptz(6),
    "updated_by" uuid,
    "id_client" uuid NOT NULL,
    "deleted_at" timestamptz(6),
    "wo_priority" character varying,
    "actual_cost" numeric,
    "attachment_goods_receipt" character varying,
    "budget_cost" numeric,
    "complete_description" character varying,
    "id_complaint" uuid,
    "kso" boolean,
    "type" character varying,
    CONSTRAINT "t_work_order_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "t_work_order_history";
CREATE TABLE "public"."t_work_order_history" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying,
    "id_user" uuid,
    "id_client" uuid,
    "created_at" timestamptz(6),
    "created_by" uuid,
    "description" character varying,
    "id_wo" uuid,
    CONSTRAINT "t_work_order_history_id" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP VIEW IF EXISTS "v_asset_depreciation";
CREATE TABLE "v_asset_depreciation" ("id" uuid, "asset_name" character varying, "asset_period" integer, "date_depre" timestamptz, "remaining_amount" double precision, "expense" double precision, "accumulated_depreciation" double precision, "id_asset" uuid, "life" integer, "accumulated_expense" double precision, "total_expense" double precision, "id_client" uuid);


DROP VIEW IF EXISTS "v_calender_maintenance";
CREATE TABLE "v_calender_maintenance" ("id" uuid, "id_client" uuid, "date" date, "status" character varying, "count" integer);


DROP VIEW IF EXISTS "v_transaction_waiting_approval";
CREATE TABLE "v_transaction_waiting_approval" ("id" uuid, "tanggal" timestamptz(6), "jumlah_status" integer);


ALTER TABLE ONLY "public"."m_approval_location" ADD CONSTRAINT "m_approval_location_id_last_location_fkey" FOREIGN KEY (id_last_location) REFERENCES m_location(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_approval_location" ADD CONSTRAINT "m_approval_location_id_new_location_fkey" FOREIGN KEY (id_new_location) REFERENCES m_location(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_approval_location" ADD CONSTRAINT "m_approval_location_id_user_fkey" FOREIGN KEY (id_user) REFERENCES m_user(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_asset" ADD CONSTRAINT "m_asset_foreign_key_category" FOREIGN KEY (id_category) REFERENCES m_category(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_asset" ADD CONSTRAINT "m_asset_foreign_key_departement" FOREIGN KEY (id_maintenance_group) REFERENCES m_maintenance_group(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_asset" ADD CONSTRAINT "m_asset_foreign_key_dimension_uom" FOREIGN KEY (id_dimesion_uom) REFERENCES m_uom(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_asset" ADD CONSTRAINT "m_asset_foreign_key_location" FOREIGN KEY (id_location) REFERENCES m_location(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_asset" ADD CONSTRAINT "m_asset_foreign_key_vendor" FOREIGN KEY (id_vendor) REFERENCES m_vendor(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_category" ADD CONSTRAINT "m_category_id_parent_fkey" FOREIGN KEY (id_parent) REFERENCES m_category(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_form" ADD CONSTRAINT "m_form_id_schedule_line_fkey" FOREIGN KEY (id_schedule_line) REFERENCES m_maintenance_schedule_line(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_form" ADD CONSTRAINT "m_form_id_user_fkey" FOREIGN KEY (id_user) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_location" ADD CONSTRAINT "id_parent" FOREIGN KEY (id_parent) REFERENCES m_location(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_maintenance_group" ADD CONSTRAINT "m_maintenance_group_id_client_fkey" FOREIGN KEY (id_client) REFERENCES m_client(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_maintenance_group_role" ADD CONSTRAINT "m_maintenance_spv_id_maintenance_group_fkey" FOREIGN KEY (id_maintenance_group) REFERENCES m_maintenance_group(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_maintenance_group_role" ADD CONSTRAINT "m_maintenance_spv_id_role_fkey" FOREIGN KEY (id_role) REFERENCES m_role(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_maintenance_group_user" ADD CONSTRAINT "m_maintenance_group_user_id_maintenance_group_role_fkey" FOREIGN KEY (id_maintenance_group_role) REFERENCES m_maintenance_group_role(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_maintenance_group_user" ADD CONSTRAINT "m_maintenance_group_user_id_user_fkey" FOREIGN KEY (id_user) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_maintenance_schedule_header" ADD CONSTRAINT "id_assign_spv" FOREIGN KEY (id_spv_assign) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_maintenance_schedule_header" ADD CONSTRAINT "id_category" FOREIGN KEY (id_category) REFERENCES m_category(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_maintenance_schedule_header" ADD CONSTRAINT "id_location" FOREIGN KEY (id_location) REFERENCES m_location(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_maintenance_schedule_header" ADD CONSTRAINT "id_maintenance_group" FOREIGN KEY (id_maintenance_group) REFERENCES m_maintenance_group(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_maintenance_schedule_header" ADD CONSTRAINT "id_maintenance_spv" FOREIGN KEY (id_spv_created) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_maintenance_schedule_header" ADD CONSTRAINT "m_maintenance_schedule_header_id_asset_fkey" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_maintenance_schedule_header" ADD CONSTRAINT "m_maintenance_schedule_header_id_standard_maintenance_fkey" FOREIGN KEY (id_standard_maintenance) REFERENCES m_standart_maintenance_task(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_maintenance_schedule_header" ADD CONSTRAINT "m_uom" FOREIGN KEY (interval_uom) REFERENCES m_uom(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_maintenance_schedule_line" ADD CONSTRAINT "id_m_maintenance_schedule" FOREIGN KEY (id_m_maintenance_schedule) REFERENCES m_maintenance_schedule_header(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_maintenance_schedule_line" ADD CONSTRAINT "m_maintenance_schedule_task_id_asset_fkey" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_maintenance_schedule_line" ADD CONSTRAINT "m_user" FOREIGN KEY (id_staff) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_maintenance_staff" ADD CONSTRAINT "fki_id_maintenance_spv" FOREIGN KEY (id_maintenance_spv) REFERENCES m_maintenance_group_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_maintenance_staff" ADD CONSTRAINT "id_staff" FOREIGN KEY (id_staff) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_material" ADD CONSTRAINT "m_material_fkey_uom" FOREIGN KEY (id_uom) REFERENCES m_uom(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_menu" ADD CONSTRAINT "m_menu_id_parent_fkey" FOREIGN KEY (id_parent) REFERENCES m_menu(id) ON DELETE SET NULL NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_menu_client" ADD CONSTRAINT "m_menu_client_id_client_fkey" FOREIGN KEY (id_client) REFERENCES m_client(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_menu_client" ADD CONSTRAINT "m_menu_client_id_menu_fkey" FOREIGN KEY (id_menu) REFERENCES m_menu(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_printer" ADD CONSTRAINT "m_printer_id_server_fkey" FOREIGN KEY (id_server) REFERENCES m_server(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_role" ADD CONSTRAINT "m_role_id_client_fkey" FOREIGN KEY (id_client) REFERENCES m_client(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_role_menu" ADD CONSTRAINT "m_role_menu_id_menu_fkey" FOREIGN KEY (id_menu) REFERENCES m_menu(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_role_menu" ADD CONSTRAINT "m_role_menu_id_role_fkey" FOREIGN KEY (id_role) REFERENCES m_role(id) ON DELETE SET NULL NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_server" ADD CONSTRAINT "m_server_id_client_fkey" FOREIGN KEY (id_client) REFERENCES m_client(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_standart_maintenance_task" ADD CONSTRAINT "m_standart_maintenance_task_id_category_fkey" FOREIGN KEY (id_category) REFERENCES m_category(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_standart_register_task" ADD CONSTRAINT "m_standart_register_task_id_standart_maintenance_task_fkey" FOREIGN KEY (id_standart_maintenance_task) REFERENCES m_standart_maintenance_task(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_standart_register_task" ADD CONSTRAINT "m_standart_register_task_id_task_register_fkey" FOREIGN KEY (id_task_register) REFERENCES m_task(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_task" ADD CONSTRAINT "m_task_id_category_fkey" FOREIGN KEY (id_category) REFERENCES m_category(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_task" ADD CONSTRAINT "m_task_id_inventory_fkey" FOREIGN KEY (id_inventory) REFERENCES m_inventory(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_task_inventory" ADD CONSTRAINT "m_task_inventory_id_inventory_fkey" FOREIGN KEY (id_inventory) REFERENCES m_inventory(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_task_inventory" ADD CONSTRAINT "m_task_inventory_id_task_fkey" FOREIGN KEY (id_task) REFERENCES m_task(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."m_user" ADD CONSTRAINT "m_user_id_client_fkey" FOREIGN KEY (id_client) REFERENCES m_client(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."m_user" ADD CONSTRAINT "m_user_id_location_fkey" FOREIGN KEY (id_location) REFERENCES m_location(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_approval" ADD CONSTRAINT "m_maintenance_schedule" FOREIGN KEY (id_maintenance_schedule) REFERENCES m_maintenance_schedule_header(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_approval" ADD CONSTRAINT "m_user" FOREIGN KEY (id_user_approval) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_approval" ADD CONSTRAINT "t_wo" FOREIGN KEY (id_wo) REFERENCES t_work_order(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_audit_log" ADD CONSTRAINT "m_user" FOREIGN KEY (id_user) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_complaint" ADD CONSTRAINT "m_location" FOREIGN KEY (id_location) REFERENCES m_location(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_complaint" ADD CONSTRAINT "m_maintenance_schedule" FOREIGN KEY (id_maintenance_group) REFERENCES m_maintenance_group(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_complaint" ADD CONSTRAINT "m_user" FOREIGN KEY (fixed_by) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_complaint" ADD CONSTRAINT "t_complaint_created_by_fkey" FOREIGN KEY (created_by) REFERENCES m_user(id) ON UPDATE CASCADE ON DELETE SET NULL NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_complaint" ADD CONSTRAINT "t_complaint_id_sparepart_fkey" FOREIGN KEY (id_sparepart) REFERENCES m_material(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_complaint" ADD CONSTRAINT "t_complaint_on_check_fkey" FOREIGN KEY (checked_by) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_complaint" ADD CONSTRAINT "t_wo" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_depreciation" ADD CONSTRAINT "t_depreciation_id_category_fkey" FOREIGN KEY (id_category) REFERENCES m_category(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_depreciation" ADD CONSTRAINT "t_depreciation_id_maintenance_group_fkey" FOREIGN KEY (id_maintenance_group) REFERENCES m_maintenance_group(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_depreciation" ADD CONSTRAINT "t_depreciation_id_user_fkey" FOREIGN KEY (id_user) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_depreciation_detail" ADD CONSTRAINT "t_depreciation_detail_id_asset_fkey" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_depreciation_detail" ADD CONSTRAINT "t_depreciation_detail_id_departement_fkey" FOREIGN KEY (id_departement) REFERENCES m_maintenance_group(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_depreciation_detail" ADD CONSTRAINT "t_depreciation_detail_id_depreciation_fkey" FOREIGN KEY (id_depreciation) REFERENCES t_depreciation(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_depreciation_expense" ADD CONSTRAINT "t_depreciation_expense_id_asset_fkey" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_disposal" ADD CONSTRAINT "t_disposal_id_approval_fkey" FOREIGN KEY (id_approval) REFERENCES t_approval(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_disposal" ADD CONSTRAINT "t_disposal_id_asset_fkey" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_disposal" ADD CONSTRAINT "t_disposal_id_departement_fkey" FOREIGN KEY (id_departement) REFERENCES m_maintenance_group(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_disposal" ADD CONSTRAINT "t_disposal_id_user_fkey" FOREIGN KEY (id_user) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_disposal_details" ADD CONSTRAINT "t_disposal_details_id_asset_fkey" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_disposal_details" ADD CONSTRAINT "t_disposal_details_id_disposal_fkey" FOREIGN KEY (id_disposal) REFERENCES t_disposal(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_history_task" ADD CONSTRAINT "t_history_task_fixed_by_fkey" FOREIGN KEY (fixed_by) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_history_task" ADD CONSTRAINT "t_history_task_hand_over_by_fkey" FOREIGN KEY (hand_over_by) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_history_task" ADD CONSTRAINT "t_history_task_id_task_fkey" FOREIGN KEY (id_task) REFERENCES t_maintenance_task(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_history_task" ADD CONSTRAINT "t_history_task_take_over_by_fkey" FOREIGN KEY (take_over_by) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_inspection_order" ADD CONSTRAINT "t_inspection_order_created_by_fkey" FOREIGN KEY (created_by) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_inspection_order" ADD CONSTRAINT "t_inspection_order_id_asset_fkey" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_inspection_order" ADD CONSTRAINT "t_inspection_order_id_category_fkey" FOREIGN KEY (id_category) REFERENCES m_category(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_inspection_order" ADD CONSTRAINT "t_inspection_order_id_inspector_fkey" FOREIGN KEY (id_inspector) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_inspection_order" ADD CONSTRAINT "t_inspection_order_id_location_fkey" FOREIGN KEY (id_location) REFERENCES m_location(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_inspection_order" ADD CONSTRAINT "t_inspection_order_id_maintenance_group_fkey" FOREIGN KEY (id_maintenance_group) REFERENCES m_maintenance_group(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_inspection_order" ADD CONSTRAINT "t_inspection_order_id_maintenance_order_fkey" FOREIGN KEY (id_maintenance_order) REFERENCES t_maintenance_order(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_inspection_order" ADD CONSTRAINT "t_inspection_order_inspection_reference_fkey" FOREIGN KEY (inspection_reference) REFERENCES t_inspection_order(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_inspection_task" ADD CONSTRAINT "t_inspection_task_id_inspection_order_fkey" FOREIGN KEY (id_inspection_order) REFERENCES t_inspection_order(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_maintenance_order" ADD CONSTRAINT "t_maintenance_order_id_asset_fkey" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_maintenance_order" ADD CONSTRAINT "t_maintenance_order_id_parent_fkey" FOREIGN KEY (id_parent) REFERENCES t_maintenance_order(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_maintenance_order" ADD CONSTRAINT "t_maintenance_order_id_standard_maintenance_task_fkey" FOREIGN KEY (id_standard_maintenance_task) REFERENCES m_standart_maintenance_task(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_maintenance_schedule_task" ADD CONSTRAINT "m_maintenance_schedule_cost_id_maintenance_schedule_task_fkey1" FOREIGN KEY (id_maintenance_schedule_task) REFERENCES m_maintenance_schedule_line(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_maintenance_schedule_task" ADD CONSTRAINT "m_maintenance_schedule_cost_id_material_fkey" FOREIGN KEY (id_staff) REFERENCES m_material(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_maintenance_schedule_task" ADD CONSTRAINT "m_maintenance_schedule_cost_id_uom_fkey" FOREIGN KEY (id_uom) REFERENCES m_uom(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_maintenance_task" ADD CONSTRAINT "m_maintenance_task_fkey_cascade_wo" FOREIGN KEY (id_cascade_wo) REFERENCES t_work_order(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_maintenance_task" ADD CONSTRAINT "m_maintenance_task_fkey_wo" FOREIGN KEY (id_wo) REFERENCES t_work_order(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_maintenance_task" ADD CONSTRAINT "t_maintenance_task_id_staff_fkey" FOREIGN KEY (id_staff) REFERENCES m_user(id) ON UPDATE CASCADE ON DELETE SET NULL NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_maintenance_task_line" ADD CONSTRAINT "t_maintenance_cost_id_maintenance_task_fkey" FOREIGN KEY (id_maintenance_task) REFERENCES t_maintenance_task(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_maintenance_task_line" ADD CONSTRAINT "t_maintenance_cost_id_material_fkey" FOREIGN KEY (id_material) REFERENCES m_material(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_maintenance_task_line" ADD CONSTRAINT "t_maintenance_cost_id_uom_fkey" FOREIGN KEY (id_uom) REFERENCES m_uom(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_material_request" ADD CONSTRAINT "t_material_request_id_maintenance_group_fkey" FOREIGN KEY (id_maintenance_group) REFERENCES m_maintenance_group(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_material_request" ADD CONSTRAINT "t_material_request_id_maintenance_order_fkey" FOREIGN KEY (id_maintenance_order) REFERENCES t_maintenance_order(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_material_request" ADD CONSTRAINT "t_material_request_id_repair_order_fkey" FOREIGN KEY (id_repair_order) REFERENCES t_repair_order(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_material_request" ADD CONSTRAINT "t_material_request_requested_by_fkey" FOREIGN KEY (requested_by) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_material_request_detail" ADD CONSTRAINT "t_material_request_detail_id_inventory_fkey" FOREIGN KEY (id_inventory) REFERENCES m_inventory(id) ON UPDATE CASCADE ON DELETE SET NULL NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_material_request_detail" ADD CONSTRAINT "t_material_request_detail_id_material_request_fkey" FOREIGN KEY (id_material_request) REFERENCES t_material_request(id) ON UPDATE CASCADE ON DELETE SET NULL NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_material_return" ADD CONSTRAINT "t_material_return_id_maintenance_order_fkey" FOREIGN KEY (id_maintenance_order) REFERENCES t_maintenance_order(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_material_return" ADD CONSTRAINT "t_material_return_id_repair_order_fkey" FOREIGN KEY (id_repair_order) REFERENCES t_repair_order(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_material_return" ADD CONSTRAINT "t_material_return_returned_by_fkey" FOREIGN KEY (returned_by) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_material_return_detail" ADD CONSTRAINT "t_material_return_detail_id_inventory_fkey" FOREIGN KEY (id_inventory) REFERENCES m_inventory(id) ON UPDATE CASCADE ON DELETE SET NULL NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_material_return_detail" ADD CONSTRAINT "t_material_return_detail_id_material_request_detail_fkey" FOREIGN KEY (id_material_request_detail) REFERENCES t_material_request_detail(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_material_return_detail" ADD CONSTRAINT "t_material_return_detail_id_material_return_fkey" FOREIGN KEY (id_material_return) REFERENCES t_material_return(id) ON UPDATE CASCADE ON DELETE SET NULL NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_material_wo" ADD CONSTRAINT "t_material_wo_id_material_fkey" FOREIGN KEY (id_material) REFERENCES m_material(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_material_wo" ADD CONSTRAINT "t_material_wo_id_wo_fkey" FOREIGN KEY (id_wo) REFERENCES t_work_order(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_movement" ADD CONSTRAINT "t_movement_created_by_fkey" FOREIGN KEY (created_by) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_movement" ADD CONSTRAINT "t_movement_id_departement_fkey" FOREIGN KEY (id_departement) REFERENCES m_maintenance_group(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_movement" ADD CONSTRAINT "t_movement_id_locatorto_fkey" FOREIGN KEY (id_locatorto) REFERENCES m_location(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_movement" ADD CONSTRAINT "t_movement_id_staff_fkey" FOREIGN KEY (id_staff) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_movement_line" ADD CONSTRAINT "t_movement_line_id_asset_fkey" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_movement_line" ADD CONSTRAINT "t_movement_line_id_locatorfrom_fkey" FOREIGN KEY (id_locatorfrom) REFERENCES m_location(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_movement_line" ADD CONSTRAINT "t_movement_line_id_locatorto_fkey" FOREIGN KEY (id_locatorto) REFERENCES m_location(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_movement_line" ADD CONSTRAINT "t_movement_line_id_movement_fkey" FOREIGN KEY (id_movement) REFERENCES t_movement(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_opname" ADD CONSTRAINT "t_opname_fkey_opname_schedule" FOREIGN KEY (id_opname_schedule) REFERENCES t_opname_schedule(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_opname" ADD CONSTRAINT "t_opname_id_category_fkey" FOREIGN KEY (id_category) REFERENCES m_category(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_opname" ADD CONSTRAINT "t_opname_location_warehouse_fkey" FOREIGN KEY (location_warehouse) REFERENCES m_location(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_opname_line" ADD CONSTRAINT "t_opname_line_id_opname_fkey" FOREIGN KEY (id_opname) REFERENCES t_opname(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_opname_line" ADD CONSTRAINT "t_opname_schedule_detail_id_asset_fkey" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_opname_schedule" ADD CONSTRAINT "t_opname_schedule_id_approval_fkey" FOREIGN KEY (id_approval) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_opname_schedule" ADD CONSTRAINT "t_opname_schedule_id_category_fkey" FOREIGN KEY (id_category) REFERENCES m_category(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_opname_schedule" ADD CONSTRAINT "t_opname_schedule_location" FOREIGN KEY (id_location) REFERENCES m_location(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_opname_schedule" ADD CONSTRAINT "t_opname_schedule_user_id_fkey" FOREIGN KEY (id_user) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_order_inventory" ADD CONSTRAINT "t_order_inventory_id_inventory_fkey" FOREIGN KEY (id_inventory) REFERENCES m_inventory(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_order_inventory" ADD CONSTRAINT "t_order_inventory_id_task_fkey" FOREIGN KEY (id_task) REFERENCES t_order_task(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_order_task" ADD CONSTRAINT "t_order_task_id_staff_fkey" FOREIGN KEY (id_staff) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_order_task" ADD CONSTRAINT "t_order_task_id_t_maintenance_order_fkey" FOREIGN KEY (id_t_maintenance_order) REFERENCES t_maintenance_order(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_preventive_history_line" ADD CONSTRAINT "t_preventive_history_line_fixed_by_fkey" FOREIGN KEY (fixed_by) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_preventive_history_line" ADD CONSTRAINT "t_preventive_history_line_hand_over_by_fkey" FOREIGN KEY (hand_over_by) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_preventive_history_line" ADD CONSTRAINT "t_preventive_history_line_id_preventive_line_fkey" FOREIGN KEY (id_preventive_line) REFERENCES t_preventive_work_order_line(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_preventive_history_line" ADD CONSTRAINT "t_preventive_history_line_take_over_by_fkey" FOREIGN KEY (take_over_by) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_preventive_work_order_header" ADD CONSTRAINT "t_preventive_work_order_header_assign_user_fkey" FOREIGN KEY (assign_user) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_preventive_work_order_header" ADD CONSTRAINT "t_preventive_work_order_header_id_asset_fkey" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_preventive_work_order_header" ADD CONSTRAINT "t_preventive_work_order_header_id_category_fkey" FOREIGN KEY (id_category) REFERENCES m_category(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_preventive_work_order_header" ADD CONSTRAINT "t_preventive_work_order_header_id_location_fkey" FOREIGN KEY (id_location) REFERENCES m_location(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_preventive_work_order_header" ADD CONSTRAINT "t_preventive_work_order_header_id_maintenance_group_fkey" FOREIGN KEY (id_maintenance_group) REFERENCES m_maintenance_group(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_preventive_work_order_header" ADD CONSTRAINT "t_preventive_work_order_header_id_maintenance_header_fkey" FOREIGN KEY (id_maintenance_header) REFERENCES m_maintenance_schedule_header(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_preventive_work_order_header" ADD CONSTRAINT "t_preventive_work_order_header_id_schedule_header_line_fkey" FOREIGN KEY (id_schedule_header_line) REFERENCES m_maintenance_schedule_line(id) ON DELETE SET NULL NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_preventive_work_order_line" ADD CONSTRAINT "t_preventive_work_order_line_id_preventive_work_order_head_fkey" FOREIGN KEY (id_preventive_work_order_header) REFERENCES t_preventive_work_order_header(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_preventive_work_order_line" ADD CONSTRAINT "t_preventive_work_order_line_id_user_fkey" FOREIGN KEY (id_user) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_printer_job" ADD CONSTRAINT "t_printer_job_id_asset_fkey" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_printer_job" ADD CONSTRAINT "t_printer_job_id_location_fkey" FOREIGN KEY (id_location) REFERENCES m_location(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_printer_job" ADD CONSTRAINT "t_printer_job_id_printer_fkey" FOREIGN KEY (id_printer) REFERENCES m_printer(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_repair_material" ADD CONSTRAINT "t_repair_material_id_inventory_fkey" FOREIGN KEY (id_inventory) REFERENCES m_inventory(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_repair_material" ADD CONSTRAINT "t_repair_material_id_repair_task_fkey" FOREIGN KEY (id_repair_task) REFERENCES t_repair_task(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_repair_order" ADD CONSTRAINT "t_repair_order_id_asset_fkey" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_repair_order" ADD CONSTRAINT "t_repair_order_id_category_fkey" FOREIGN KEY (id_category) REFERENCES m_category(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_repair_order" ADD CONSTRAINT "t_repair_order_id_inspection_order_fkey" FOREIGN KEY (id_inspection_order) REFERENCES t_inspection_order(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_repair_order" ADD CONSTRAINT "t_repair_order_id_location_fkey" FOREIGN KEY (id_location) REFERENCES m_location(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_repair_order" ADD CONSTRAINT "t_repair_order_id_maintenance_group_fkey" FOREIGN KEY (id_maintenance_group) REFERENCES m_maintenance_group(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_repair_order" ADD CONSTRAINT "t_repair_order_id_maintenance_order_fkey" FOREIGN KEY (id_maintenance_order) REFERENCES t_maintenance_order(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_repair_order" ADD CONSTRAINT "t_repair_order_id_vendor_fkey" FOREIGN KEY (id_vendor) REFERENCES m_vendor(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_repair_order" ADD CONSTRAINT "t_repair_order_requested_by_fkey" FOREIGN KEY (requested_by) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_repair_task" ADD CONSTRAINT "t_repair_task_id_repair_order_fkey" FOREIGN KEY (id_repair_order) REFERENCES t_repair_order(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_repair_task" ADD CONSTRAINT "t_repair_task_id_task_fkey" FOREIGN KEY (id_task) REFERENCES m_task(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_repair_task" ADD CONSTRAINT "t_repair_task_id_user_fkey" FOREIGN KEY (id_user) REFERENCES m_user(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_work_order" ADD CONSTRAINT "id_asset" FOREIGN KEY (id_asset) REFERENCES m_asset(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_work_order" ADD CONSTRAINT "id_complaint_user" FOREIGN KEY (id_complaint_user) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_work_order" ADD CONSTRAINT "id_maintenance_group" FOREIGN KEY (id_maintenance_group) REFERENCES m_maintenance_group(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_work_order" ADD CONSTRAINT "id_maintenance_leader" FOREIGN KEY (id_maintenance_leader) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_work_order" ADD CONSTRAINT "id_maintenance_spv" FOREIGN KEY (id_spv) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_work_order" ADD CONSTRAINT "id_t_maintenance_schedule" FOREIGN KEY (id_maintenance_schedule) REFERENCES m_maintenance_schedule_header(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_work_order" ADD CONSTRAINT "id_vendor" FOREIGN KEY (id_vendor) REFERENCES m_vendor(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_work_order" ADD CONSTRAINT "t_work_order_id_complaint_fkey" FOREIGN KEY (id_complaint) REFERENCES t_complaint(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."t_work_order_history" ADD CONSTRAINT "t_work_order_history_id_user_fkey" FOREIGN KEY (id_user) REFERENCES m_user(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."t_work_order_history" ADD CONSTRAINT "t_work_order_history_id_wo_fkey" FOREIGN KEY (id_wo) REFERENCES t_work_order(id) ON DELETE CASCADE NOT DEFERRABLE;

DROP TABLE IF EXISTS "v_asset_depreciation";
CREATE VIEW "v_asset_depreciation" AS SELECT a.id,
    a.name AS asset_name,
    COALESCE(e.asset_period, NULL::integer) AS asset_period,
    COALESCE(e.period, NULL::timestamp with time zone) AS date_depre,
    COALESCE(e.remaining_amount, (a.asset_value)::double precision) AS remaining_amount,
    COALESCE(a.expense, NULL::double precision) AS expense,
    COALESCE((a.accumulated_depreciation_value)::double precision, NULL::double precision) AS accumulated_depreciation,
    a.id AS id_asset,
    a.life,
    (a.expense * ((COALESCE(e.asset_period, NULL::integer))::numeric)::double precision) AS accumulated_expense,
    COALESCE(( SELECT sum(t_exp.expense) AS sum
           FROM t_depreciation_expense t_exp
          WHERE (t_exp.id_asset = a.id)), (0)::double precision) AS total_expense,
    a.id_client
   FROM (m_asset a
     LEFT JOIN ( SELECT t.id_asset,
            t.asset_period,
            t.date_depre,
            t.remaining_amount,
            t.period,
            row_number() OVER (PARTITION BY t.id_asset ORDER BY t.period DESC) AS rn
           FROM t_depreciation_expense t) e ON (((a.id = e.id_asset) AND (e.rn = 1))))
  WHERE ((a.depreciate = true) AND ((a.asset_status)::text <> 'Dispose'::text));

DROP TABLE IF EXISTS "v_calender_maintenance";
CREATE VIEW "v_calender_maintenance" AS WITH combined_data AS (
         SELECT gen_random_uuid() AS id,
            t_preventive_work_order_header.id_client,
            date((t_preventive_work_order_header.preventive_date AT TIME ZONE 'UTC'::text)) AS date,
            t_preventive_work_order_header.status,
            (count(*))::integer AS count
           FROM t_preventive_work_order_header
          GROUP BY t_preventive_work_order_header.id_client, (date((t_preventive_work_order_header.preventive_date AT TIME ZONE 'UTC'::text))), t_preventive_work_order_header.status
         HAVING (count(*) > 0)
        UNION ALL
         SELECT gen_random_uuid() AS id,
            t_maintenance_order.id_client,
            date((t_maintenance_order.created_at AT TIME ZONE 'UTC'::text)) AS date,
            t_maintenance_order.status,
            (count(*))::integer AS count
           FROM t_maintenance_order
          WHERE (t_maintenance_order.deleted_at IS NULL)
          GROUP BY t_maintenance_order.id_client, (date((t_maintenance_order.created_at AT TIME ZONE 'UTC'::text))), t_maintenance_order.status
         HAVING (count(*) > 0)
        )
 SELECT id,
    id_client,
    date,
    status,
    count
   FROM combined_data
  ORDER BY date, id_client, status;

DROP TABLE IF EXISTS "v_transaction_waiting_approval";
CREATE VIEW "v_transaction_waiting_approval" AS SELECT gen_random_uuid() AS id,
    tanggal,
    (count(*))::integer AS jumlah_status
   FROM ( SELECT t_work_order.complaint_date_request AS tanggal
           FROM t_work_order
          WHERE (((t_work_order.status)::text = 'Waiting Approval'::text) AND ((t_work_order.status)::text = 'Request to Compelete'::text) AND (t_work_order.id_complaint_user IS NOT NULL) AND (t_work_order.complaint_date_request IS NOT NULL))
        UNION ALL
         SELECT t_complaint.complaint_date AS tanggal
           FROM t_complaint
          WHERE (((t_complaint.status)::text = 'Waiting Checking'::text) AND (t_complaint.complaint_date IS NOT NULL))
        UNION ALL
         SELECT m_maintenance_schedule_header.created_at AS tanggal
           FROM m_maintenance_schedule_header
          WHERE (((m_maintenance_schedule_header.approval_status)::text = 'Waiting Approval'::text) AND (m_maintenance_schedule_header.created_at IS NOT NULL))
        UNION ALL
         SELECT t_opname.date_opname AS tanggal
           FROM t_opname
          WHERE (((t_opname.status)::text = 'Waiting Approval'::text) AND (t_opname.date_opname IS NOT NULL))
        UNION ALL
         SELECT t_disposal.date_disposal AS tanggal
           FROM t_disposal
          WHERE (((t_disposal.status)::text = 'Waiting Approval'::text) AND (t_disposal.date_disposal IS NOT NULL))) combined_dates
  GROUP BY tanggal
 HAVING (count(*) > 0)
  ORDER BY tanggal;

-- 2025-12-17 08:06:19 UTC
