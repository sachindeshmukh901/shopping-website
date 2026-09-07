import {
  User,
  Shield,
  Bell,
  Store,
  Globe,
  Lock,
  Save
} from "lucide-react";

import { useState } from "react";

import "./settings.css";


function Settings() {

  let [settings, setSettings] = useState({

    platformName: "ORGOS",

    adminName: "ORGOS Admin",

    email: "admin@orgos.com",

    phone: "",

    notifications: true,

    emailNotifications: true,

    vendorRegistration: true,

    customerRegistration: true,

    maintenanceMode: false

  });


  let handleChange = (event) => {

    let {
      name,
      value,
      type,
      checked
    } = event.target;


    setSettings((previous) => ({

      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value

    }));

  };


  let handleSave = () => {

    localStorage.setItem(
      "adminSettings",
      JSON.stringify(settings)
    );

    alert("Settings saved successfully.");

  };


  return (

    <div className="settings-page">

      {/* ======================================
                HEADER
            ====================================== */}

      <div className="settings-header">

        <div>

          <h1>
            Settings
          </h1>

          <p>
            Manage your ORGOS admin platform settings.
          </p>

        </div>


        <button
          type="button"
          className="settings-save-button"
          onClick={handleSave}
        >

          <Save size={18} />

          Save Changes

        </button>

      </div>


      {/* ======================================
                GENERAL SETTINGS
            ====================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-icon green">

            <Globe size={21} />

          </div>


          <div>

            <h2>
              General Settings
            </h2>

            <p>
              Basic information about your ORGOS platform.
            </p>

          </div>

        </div>


        <div className="settings-grid">

          <div className="settings-field">

            <label>
              Platform Name
            </label>

            <input
              type="text"
              name="platformName"
              value={settings.platformName}
              onChange={handleChange}
              placeholder="Platform name"
            />

          </div>


          <div className="settings-field">

            <label>
              Admin Name
            </label>

            <input
              type="text"
              name="adminName"
              value={settings.adminName}
              onChange={handleChange}
              placeholder="Admin name"
            />

          </div>


          <div className="settings-field">

            <label>
              Admin Email
            </label>

            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
              placeholder="Admin email"
            />

          </div>


          <div className="settings-field">

            <label>
              Phone Number
            </label>

            <input
              type="text"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />

          </div>

        </div>

      </section>


      {/* ======================================
                ACCOUNT SECURITY
            ====================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-icon blue">

            <Shield size={21} />

          </div>


          <div>

            <h2>
              Account & Security
            </h2>

            <p>
              Manage administrator account security.
            </p>

          </div>

        </div>


        <div className="settings-option">

          <div className="option-left">

            <div className="option-icon">

              <User size={19} />

            </div>


            <div>

              <strong>
                Administrator Account
              </strong>

              <span>
                Manage your administrator profile.
              </span>

            </div>

          </div>


          <button
            type="button"
            className="secondary-button"
          >
            Manage
          </button>

        </div>


        <div className="settings-option">

          <div className="option-left">

            <div className="option-icon">

              <Lock size={19} />

            </div>


            <div>

              <strong>
                Change Password
              </strong>

              <span>
                Update your administrator password.
              </span>

            </div>

          </div>


          <button
            type="button"
            className="secondary-button"
          >
            Change
          </button>

        </div>

      </section>


      {/* ======================================
                NOTIFICATIONS
            ====================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-icon orange">

            <Bell size={21} />

          </div>


          <div>

            <h2>
              Notifications
            </h2>

            <p>
              Control admin notification preferences.
            </p>

          </div>

        </div>


        <div className="settings-toggle-row">

          <div>

            <strong>
              Push Notifications
            </strong>

            <span>
              Receive important platform notifications.
            </span>

          </div>


          <label className="switch">

            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
            />

            <span className="slider">
            </span>

          </label>

        </div>


        <div className="settings-toggle-row">

          <div>

            <strong>
              Email Notifications
            </strong>

            <span>
              Receive platform updates through email.
            </span>

          </div>


          <label className="switch">

            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
            />

            <span className="slider">
            </span>

          </label>

        </div>

      </section>


      {/* ======================================
                PLATFORM CONTROL
            ====================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-icon purple">

            <Store size={21} />

          </div>


          <div>

            <h2>
              Platform Controls
            </h2>

            <p>
              Control registrations and platform availability.
            </p>

          </div>

        </div>


        <div className="settings-toggle-row">

          <div>

            <strong>
              Vendor Registration
            </strong>

            <span>
              Allow new vendors to register.
            </span>

          </div>


          <label className="switch">

            <input
              type="checkbox"
              name="vendorRegistration"
              checked={settings.vendorRegistration}
              onChange={handleChange}
            />

            <span className="slider">
            </span>

          </label>

        </div>


        <div className="settings-toggle-row">

          <div>

            <strong>
              Customer Registration
            </strong>

            <span>
              Allow new customers to create accounts.
            </span>

          </div>


          <label className="switch">

            <input
              type="checkbox"
              name="customerRegistration"
              checked={settings.customerRegistration}
              onChange={handleChange}
            />

            <span className="slider">
            </span>

          </label>

        </div>


        <div className="settings-toggle-row danger-row">

          <div>

            <strong>
              Maintenance Mode
            </strong>

            <span>
              Temporarily disable platform access.
            </span>

          </div>


          <label className="switch">

            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
            />

            <span className="slider">
            </span>

          </label>

        </div>

      </section>

    </div>

  );

}


export default Settings;