import { compliancesService } from "../compliances.service";

export const directorComplianceService = {
    get_overview: compliancesService.overview_director,
    get_items: compliancesService.compliance_items_director,
    add_item: compliancesService.add_compliance_item,
    update_item: compliancesService.update_compliance_item,
    delete_item: compliancesService.delete_compliance_item,
    add_log_note: compliancesService.log_note,
    toggle_checklist: compliancesService.checklist_toggle,
};
