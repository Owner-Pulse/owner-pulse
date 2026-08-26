import { compliancesService } from "../compliances.service";

export const ownerComplianceService = {
    get_overview: compliancesService.overview_owner,
    get_items: compliancesService.compliance_items,
    get_pulse_impact: compliancesService.pulse_impact,
    add_item: compliancesService.add_compliance_item,
    update_item: compliancesService.update_compliance_item,
    delete_item: compliancesService.delete_compliance_item,
    add_log_note: compliancesService.log_note,
    toggle_checklist: compliancesService.checklist_toggle,
    get_insurance_shopping: compliancesService.insurance_Shopping,
    add_quote: compliancesService.add_quotes,
    select_quote: compliancesService.select_quotes,
    complete_insurance_shopping: compliancesService.complete_insurance_shopping,
};
