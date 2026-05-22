import { useMemo, useState } from "react";
import Select from "react-select";
import { Country, City } from "country-state-city";
import { CURRENCIES } from "../context/CurrencyContext";

// ─── Shared react-select styles ───────────────────────────────────────────────
function buildSelectStyles(darkMode = false) {
    const bg = darkMode ? "rgba(255,255,255,0.06)" : "#f3f4f6";
    const border = darkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb";
    const text = darkMode ? "#fff" : "#111827";
    const placeholderColor = darkMode ? "#6b7280" : "#9ca3af";
    const menuBg = darkMode ? "#1e293b" : "#fff";
    const hoverBg = darkMode ? "rgba(59,130,246,0.15)" : "#eff6ff";
    const selectedBg = darkMode ? "rgba(59,130,246,0.3)" : "#dbeafe";

    return {
        control: (base, state) => ({
            ...base,
            background: bg,
            border: `1px solid ${state.isFocused ? "#3b82f6" : border}`,
            borderRadius: "0.75rem",
            minHeight: "42px",
            boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
            color: text,
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": { borderColor: "#3b82f6" },
        }),
        singleValue: (base) => ({ ...base, color: text, fontSize: "0.875rem" }),
        placeholder: (base) => ({ ...base, color: placeholderColor, fontSize: "0.875rem" }),
        input: (base) => ({ ...base, color: text, fontSize: "0.875rem" }),
        menu: (base) => ({
            ...base,
            background: menuBg,
            border: `1px solid ${border}`,
            borderRadius: "0.75rem",
            overflow: "hidden",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            zIndex: 9999,
        }),
        menuList: (base) => ({ ...base, padding: "4px", maxHeight: "220px" }),
        option: (base, state) => ({
            ...base,
            background: state.isSelected ? selectedBg : state.isFocused ? hoverBg : "transparent",
            color: state.isSelected ? "#1d4ed8" : text,
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            padding: "8px 12px",
            cursor: "pointer",
        }),
        dropdownIndicator: (base) => ({ ...base, color: placeholderColor, padding: "0 8px" }),
        clearIndicator: (base) => ({ ...base, color: placeholderColor, padding: "0 4px" }),
        indicatorSeparator: () => ({ display: "none" }),
        noOptionsMessage: (base) => ({ ...base, color: placeholderColor, fontSize: "0.8rem" }),
    };
}

// ─── Country Select ───────────────────────────────────────────────────────────
export function CountrySelect({ value, onChange, darkMode = false }) {
    const options = useMemo(() =>
        Country.getAllCountries().map((c) => ({
            value: c.isoCode,
            label: `${c.flag ?? ""} ${c.name}`,
            name: c.name,
        })), []
    );

    const selected = value
        ? options.find((o) => o.name === value || o.value === value) || null
        : null;

    return (
        <Select
            options={options}
            value={selected}
            onChange={(opt) => onChange(opt ? opt.name : "", opt ? opt.value : "")}
            placeholder="Rechercher un pays..."
            isClearable
            isSearchable
            styles={buildSelectStyles(darkMode)}
            noOptionsMessage={() => "Aucun pays trouvé"}
        />
    );
}

// ─── City Select ─────────────────────────────────────────────────────────────
export function CitySelect({ countryCode, value, onChange, darkMode = false }) {
    const options = useMemo(() => {
        if (!countryCode) return [];
        return City.getCitiesOfCountry(countryCode).map((c) => ({
            value: c.name,
            label: c.name,
        }));
    }, [countryCode]);

    const selected = value ? { value, label: value } : null;

    return (
        <Select
            options={options}
            value={selected}
            onChange={(opt) => onChange(opt ? opt.value : "")}
            placeholder={countryCode ? "Rechercher une ville..." : "Sélectionnez d'abord un pays"}
            isClearable
            isSearchable
            isDisabled={!countryCode}
            styles={buildSelectStyles(darkMode)}
            noOptionsMessage={() => "Aucune ville trouvée"}
        />
    );
}

// ─── Currency Select ──────────────────────────────────────────────────────────
export function CurrencySelect({ value, onChange, darkMode = false }) {
    const options = useMemo(() =>
        CURRENCIES.map((c) => ({
            value: c.code,
            label: `${c.symbol} — ${c.name} (${c.code})`,
            code: c.code,
        })), []
    );

    const selected = value
        ? options.find((o) => o.code === value) || null
        : null;

    return (
        <Select
            options={options}
            value={selected}
            onChange={(opt) => onChange(opt ? opt.value : "MAD")}
            placeholder="Sélectionnez une devise..."
            isClearable={false}
            isSearchable
            styles={buildSelectStyles(darkMode)}
            noOptionsMessage={() => "Aucune devise trouvée"}
        />
    );
}
